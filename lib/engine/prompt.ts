import type { DocType, VulnProfile } from '../types';
import { INJECTION_DEFENSE_INSTRUCTION } from './guard';
import { getKnowledgePack } from '../knowledge';

const PROFILE_FOCUS = {
  AUTHORITY_DOMINANT: '기관·권위 사칭',
  URGENCY_DOMINANT: '시간 압박',
  GREED_DOMINANT: '이득·환급 제안',
} as const;

export function buildSystemPrompt(
  docType: DocType,
  stage: 'triage' | 'full',
  profile?: VulnProfile,
): string {
  const pack = getKnowledgePack(docType);
  const profileFocus =
    profile && Object.hasOwn(PROFILE_FOCUS, profile.typeCode)
      ? PROFILE_FOCUS[profile.typeCode as keyof typeof PROFILE_FOCUS]
      : undefined;
  const scopeInstruction =
    stage === 'triage'
      ? '지금은 트리아지 단계입니다. 가장 명백한 위험(danger) 2~3개만 빠르게 찾아 findings에 담고, missingDocuments/unverifiable/requestPhrases/officialChannels/needsExpertReview는 빈 배열로 두세요.'
      : '지금은 정밀 분석 단계입니다. findings, missingDocuments, unverifiable, requestPhrases, officialChannels, needsExpertReview, summary를 모두 채우세요.';
  const resultShape = JSON.stringify({
    overallLevel: 'warning',
    summary: '조건부 상태 요약',
    findings: [
      {
        id: 'finding-1',
        level: 'warning',
        clauseTitle: '',
        quote: '문서 원문 인용',
        reason: '위험 수준의 이유',
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
    personalized: profileFocus ? '사용자 유형 맞춤 한마디' : '',
  });

  return [
    '당신은 계약서·문자를 판독해 사용자에게 위험을 근거와 함께 설명하는 unmask의 분석 엔진입니다.',
    INJECTION_DEFENSE_INSTRUCTION,
    '',
    `[지식 팩: ${pack.label}]`,
    pack.knowledge,
    '',
    scopeInstruction,
    '',
    '반드시 지켜야 할 규칙:',
    '- findings의 quote는 문서 원문에 실제로 있는 문장을 그대로 인용해야 합니다. 지어내지 마세요.',
    '- 근거(quote)가 없으면 그 위험은 표시하지 마세요.',
    '- summary는 예/아니오 판정이 아니라 조건부 상태로 쓰세요.',
    `- 다음 JSON 구조와 동일한 필드와 값 유형만 출력하세요: ${resultShape}`,
    '- docType과 scannedAt은 서버가 추가하므로 출력하지 마세요.',
    '- JSON 외의 텍스트나 마크다운 코드 블록은 출력하지 마세요.',
    profileFocus
      ? `- 사용자는 ${profileFocus}에 특히 취약합니다. personalized에 이에 맞춘 한마디를 담으세요.`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}
