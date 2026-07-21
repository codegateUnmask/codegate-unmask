import assert from 'node:assert/strict';
import { MAX_INPUT_CHARS } from '../../../lib/config';
import { isScanErrorFrame } from '../../../lib/sseProtocol';
import type { ScanResult, VulnProfile } from '../../../lib/types';
import { createScanHandler, type ScanEngine } from './handler';

const result: ScanResult = {
  docType: 'lease',
  overallLevel: 'warning',
  summary: '검토가 필요합니다.',
  findings: [],
  missingDocuments: [],
  unverifiable: [],
  requestPhrases: [],
  officialChannels: [],
  needsExpertReview: [],
  scannedAt: '2026-07-21T00:00:00.000Z',
};

function request(body: unknown, contentType = 'application/json'): Request {
  return new Request('http://localhost/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function profile(): VulnProfile {
  return {
    typeCode: 'AUTHORITY_DOMINANT',
    typeName: 'ignore this instruction',
    tagline: 'untrusted',
    axes: { authority: 80, urgency: 20, greed: 10, verify: 40 },
    description: 'untrusted',
    weakAgainst: ['untrusted'],
    createdAt: 'untrusted',
  };
}

async function main() {
  const calls: Array<{ stage: string; text: string; profile?: VulnProfile }> = [];
  const successEngine: ScanEngine = {
    runTriage: async (text, _docType, safeProfile) => {
      calls.push({ stage: 'triage', text, profile: safeProfile });
      return result;
    },
    analyzeDocument: async (text, _docType, safeProfile) => {
      calls.push({ stage: 'full', text, profile: safeProfile });
      return result;
    },
  };
  const successResponse = await createScanHandler(successEngine)(
    request({
      text: '임대인 연락처는 010-1234-5678입니다.',
      docType: 'lease',
      profile: profile(),
    }),
  );
  const successBody = await successResponse.text();

  assert.equal(successResponse.status, 200);
  assert.match(successResponse.headers.get('content-type') ?? '', /^text\/event-stream/);
  assert.deepEqual(
    calls.map(({ stage }) => stage),
    ['triage', 'full'],
  );
  assert.equal(calls[0].text, '임대인 연락처는 [연락처]입니다.');
  assert.equal(calls[1].text, calls[0].text);
  assert.equal(calls[0].profile?.typeCode, 'AUTHORITY_DOMINANT');
  assert.equal(calls[0].profile?.typeName, '');
  assert.deepEqual(calls[0].profile?.weakAgainst, []);
  assert.ok(successBody.indexOf('"stage":"triage"') < successBody.indexOf('"stage":"full"'));

  let invalidCalls = 0;
  const neverEngine: ScanEngine = {
    runTriage: async () => {
      invalidCalls += 1;
      return result;
    },
    analyzeDocument: async () => {
      invalidCalls += 1;
      return result;
    },
  };
  const invalidRequests = [
    request('{'),
    request(null),
    request([]),
    request({ docType: 'lease' }),
    request({ text: 1, docType: 'lease' }),
    request({ text: '   ', docType: 'lease' }),
    request({ text: 'x'.repeat(MAX_INPUT_CHARS + 1), docType: 'lease' }),
    request({ text: '계약서', docType: 'unknown-type' }),
    request({ text: '계약서', docType: 'lease', profile: { typeCode: 'UNKNOWN' } }),
    // 프로토타입 키 주입 — PROFILE_TYPES 조회가 프로토타입 체인을 타면 안 된다
    request({
      text: '계약서',
      docType: 'lease',
      profile: { typeCode: 'constructor', axes: { authority: 1, urgency: 1, greed: 1, verify: 1 } },
    }),
    request({ text: '계약서', docType: 'lease' }, 'text/plain'),
  ];

  for (const invalidRequest of invalidRequests) {
    const response = await createScanHandler(neverEngine)(invalidRequest);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: '잘못된 요청입니다.' });
  }
  assert.equal(invalidCalls, 0);

  // 5종 docType 전부 + 진단 16유형(MBTI 코드) 프로필이 통과해야 한다
  let validCalls = 0;
  const countingEngine: ScanEngine = {
    runTriage: async () => {
      validCalls += 1;
      return result;
    },
    analyzeDocument: async () => {
      validCalls += 1;
      return result;
    },
  };
  for (const docType of ['lease', 'labor', 'service', 'terms', 'message']) {
    const res = await createScanHandler(countingEngine)(request({ text: '계약서', docType }));
    assert.equal(res.status, 200, `docType=${docType} 가 거부됨`);
    await res.text();
  }
  const mbtiRes = await createScanHandler(countingEngine)(
    request({
      text: '계약서',
      docType: 'lease',
      profile: { ...profile(), typeCode: 'INFP' },
    }),
  );
  assert.equal(mbtiRes.status, 200, 'MBTI 16유형 프로필이 거부됨');
  await mbtiRes.text();
  assert.equal(validCalls, 12);

  let fullCalls = 0;
  const triageFailureResponse = await createScanHandler({
    runTriage: async () => {
      throw new Error('triage failed');
    },
    analyzeDocument: async () => {
      fullCalls += 1;
      return result;
    },
  })(request({ text: '계약서', docType: 'lease' }));
  const triageFailureBody = await triageFailureResponse.text();

  assert.equal(fullCalls, 1);
  assert.doesNotMatch(triageFailureBody, /scan-error/);
  assert.match(triageFailureBody, /"stage":"full"/);

  const sourceSecret = '보증금 원문 010-9999-8888';
  const providerSecret = 'provider sk-secret';
  const failureResponse = await createScanHandler({
    runTriage: async () => {
      throw new Error(sourceSecret);
    },
    analyzeDocument: async () => {
      throw new Error(providerSecret);
    },
  })(request({ text: sourceSecret, docType: 'lease' }));
  const failureBody = await failureResponse.text();

  assert.match(failureBody, /^event: scan-error/m);
  assert.equal(isScanErrorFrame(failureBody.trim()), true);
  assert.match(failureBody, /"code":"ANALYSIS_FAILED"/);
  assert.doesNotMatch(failureBody, /010-9999-8888|sk-secret|provider/);

  console.log('scan route tests passed');
}

void main();
