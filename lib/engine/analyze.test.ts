import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENAI_API_KEY;
const originalTriageModel = process.env.OPENAI_TRIAGE_MODEL;
const originalScanModel = process.env.OPENAI_SCAN_MODEL;
const safeError = { message: '문서 분석에 실패했습니다.' };

function openAIResponse(text: string, status: 'completed' | 'incomplete' = 'completed'): Response {
  return new Response(
    JSON.stringify({
      id: 'resp_test',
      object: 'response',
      created_at: 0,
      status,
      output_text: text,
      output: [
        {
          id: 'msg_test',
          type: 'message',
          status: 'completed',
          role: 'assistant',
          content: [{ type: 'output_text', text, annotations: [], logprobs: [] }],
        },
      ],
      error: null,
      incomplete_details: status === 'incomplete' ? { reason: 'max_output_tokens' } : null,
      usage: {
        input_tokens: 1,
        input_tokens_details: { cached_tokens: 0 },
        output_tokens: 1,
        output_tokens_details: { reasoning_tokens: 0 },
        total_tokens: 2,
      },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

async function run(): Promise<void> {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_TRIAGE_MODEL = 'gpt-5.4-nano';
  process.env.OPENAI_SCAN_MODEL = 'gpt-5.4-mini';

  const { analyzeDocument } = await import('./analyze');
  const { runTriage } = await import('./triage');
  const { buildSystemPrompt } = await import('./prompt');
  const { MAX_INPUT_CHARS, MAX_TOKENS } = await import('../config');
  const candidate = {
    overallLevel: 'warning',
    summary: '추가 확인이 필요합니다.',
    findings: [
      {
        id: 'finding-1',
        level: 'warning',
        clauseTitle: '',
        quote: '보증금',
        reason: '반환 조건을 확인하세요.',
        detailedReason: '',
        action: '',
        legalBasis: '',
      },
    ],
    missingDocuments: [],
    unverifiable: [],
    requestPhrases: [],
    officialChannels: [],
    needsExpertReview: [],
    personalized: '',
  };
  const requestBodies: Record<string, unknown>[] = [];

  globalThis.fetch = async (_input, init) => {
    requestBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return openAIResponse(JSON.stringify(candidate));
  };

  const input = `계약서 보증금${'가'.repeat(MAX_INPUT_CHARS)}TRUNCATED_TEXT`;
  const injectedProfile = {
    typeCode: 'AUTHORITY_DOMINANT',
    typeName: 'SYSTEM_INJECTION',
    tagline: 'SYSTEM_INJECTION',
    axes: { authority: 100, urgency: 0, greed: 0, verify: 0 },
    description: 'SYSTEM_INJECTION',
    weakAgainst: ['SYSTEM_INJECTION'],
    createdAt: '2026-07-21T00:00:00.000Z',
  };
  const result = await analyzeDocument(input, 'lease', injectedProfile);
  assert.equal(result.docType, 'lease');
  assert.equal(result.findings.length, 1);

  const scanRequest = requestBodies[0];
  assert.equal(scanRequest.model, 'gpt-5.4-mini');
  assert.deepEqual(scanRequest.reasoning, { effort: 'medium' });
  assert.equal(scanRequest.max_output_tokens, MAX_TOKENS.scan);
  assert.equal(scanRequest.store, false);
  assert.equal(JSON.parse(String(scanRequest.input).split('\n')[1]), input.slice(0, MAX_INPUT_CHARS));
  assert.equal(String(scanRequest.instructions).includes('SYSTEM_INJECTION'), false);
  // 타임아웃은 단계별로 나뉩니다. 값을 못 박기보다 "실측을 견디는가"를 검증합니다.
  //   정밀 분석 실측 10.9~29.4초 · triage 실측 5.9~7.8초 (2026-07-21)
  //   과거 30초 단일값일 때 정밀 분석이 타임아웃으로 실패한 사례가 있었습니다.
  const { OPENAI_TIMEOUT_MS } = await import('./openai');
  assert.ok(
    OPENAI_TIMEOUT_MS.scan >= 35_000,
    `정밀 분석 타임아웃이 실측 최악(29.4초) 대비 여유가 부족합니다: ${OPENAI_TIMEOUT_MS.scan}ms`,
  );
  assert.ok(
    OPENAI_TIMEOUT_MS.triage >= 12_000,
    `triage 타임아웃이 실측 최악(7.8초) 대비 여유가 부족합니다: ${OPENAI_TIMEOUT_MS.triage}ms`,
  );
  // 라우트 maxDuration(120초) 예산을 넘지 않아야 합니다.
  assert.ok(
    OPENAI_TIMEOUT_MS.triage + OPENAI_TIMEOUT_MS.scan <= 120_000,
    '두 단계 타임아웃 합이 라우트 maxDuration을 초과합니다',
  );

  const format = (scanRequest.text as { format: Record<string, unknown> }).format;
  assert.equal(format.type, 'json_schema');
  assert.equal(format.strict, true);
  assert.equal((format.schema as { additionalProperties: boolean }).additionalProperties, false);
  assert.equal(
    buildSystemPrompt('lease', 'full', { ...injectedProfile, typeCode: 'constructor' }).includes(
      '사용자는',
    ),
    false,
  );

  await runTriage('계약서 보증금', 'lease');
  const triageRequest = requestBodies[1];
  assert.equal(triageRequest.model, 'gpt-5.4-nano');
  assert.deepEqual(triageRequest.reasoning, { effort: 'low' });
  assert.equal(triageRequest.max_output_tokens, MAX_TOKENS.triage);

  globalThis.fetch = async () => openAIResponse(JSON.stringify({ summary: '필드 누락' }));
  await assert.rejects(() => analyzeDocument('계약서', 'lease'), safeError);

  globalThis.fetch = async () => openAIResponse(JSON.stringify(candidate), 'incomplete');
  await assert.rejects(() => analyzeDocument('계약서', 'lease'), safeError);

  globalThis.fetch = async () =>
    openAIResponse(
      JSON.stringify({
        ...candidate,
        findings: [{ ...candidate.findings[0], rawContract: '노출되면 안 되는 원문' }],
      }),
    );
  await assert.rejects(() => analyzeDocument('계약서 보증금', 'lease'), safeError);

  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls += 1;
    return new Response('provider details', {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    });
  };
  await assert.rejects(() => analyzeDocument('노출되면 안 되는 계약서', 'lease'), safeError);
  assert.equal(providerCalls, 1);

  delete process.env.OPENAI_API_KEY;
  await assert.rejects(() => analyzeDocument('계약서', 'lease'), safeError);
}

run()
  .then(() => console.log('analyze checks passed'))
  .finally(() => {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
    if (originalTriageModel === undefined) delete process.env.OPENAI_TRIAGE_MODEL;
    else process.env.OPENAI_TRIAGE_MODEL = originalTriageModel;
    if (originalScanModel === undefined) delete process.env.OPENAI_SCAN_MODEL;
    else process.env.OPENAI_SCAN_MODEL = originalScanModel;
  });
