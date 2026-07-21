// ============================================================
// 공용 시스템 프롬프트 빌더 — triage.ts / analyze.ts가 함께 씁니다.
// [담당: 코어 오너(A)]
// ============================================================

import type { DocType, VulnProfile } from '../types';
import { INJECTION_DEFENSE_INSTRUCTION } from './guard';
import { getKnowledgePack } from '../knowledge';

/** stage: 'triage'면 상위 위험 위주로 짧게, 'full'이면 7항목 전체를 요구 */
export function buildSystemPrompt(
  docType: DocType,
  stage: 'triage' | 'full',
  profile?: VulnProfile,
): string {
  const pack = getKnowledgePack(docType);

  const scopeInstruction =
    stage === 'triage'
      ? '지금은 트리아지 단계입니다. 가장 명백한 위험(danger) 2~3개만 빠르게 찾아 findings에 담고, missingDocuments/unverifiable/requestPhrases/officialChannels/needsExpertReview는 빈 배열로 두세요.'
      : '지금은 정밀 분석 단계입니다. 7항목(findings, missingDocuments, unverifiable, requestPhrases, officialChannels, needsExpertReview, summary) 모두 채우세요.';

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
    '- 종합(summary)은 "예/아니오" 판정이 아니라 조건부 상태로 쓰세요. (예: "지금 상태로는 서명을 권하지 않음. N개가 해소되면 위험 감소")',
    '- 반드시 ScanResult 타입과 동일한 구조의 JSON만 출력하세요. 다른 텍스트를 덧붙이지 마세요.',
    profile
      ? `- 사용자 취약 유형: ${profile.typeName} (${profile.weakAgainst.join(', ')}에 특히 취약). personalized 필드에 이 유형에 맞춘 한마디를 담으세요.`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}
