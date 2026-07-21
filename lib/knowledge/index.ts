// ============================================================
// 지식 팩 레지스트리 — [담당: 지식·프롬프트]
// 팩 = {과업 분해, 지식 소스, 문구 수신자, 공식 확인 경로}.
// 이 파일 하나로 docType → 팩을 매핑합니다. 엔진(analyze/triage)은 이것만 봅니다.
// ============================================================

import type { DocType } from '../types';
import { leasePack } from './lease';
import { laborPack } from './labor';
import { termsPack } from './terms';
import { smishingPack } from './smishing';

export interface KnowledgePack {
  label: string;
  /** 과업 분해 — 이 문서 유형에서 반드시 점검할 항목 체크리스트 */
  tasks: string[];
  /**
   * 프롬프트에 주입할 지식 원문 (법령·표준계약서·독소조항 사례 등).
   * ⚠️ 반드시 실제 출처를 확인한 내용만 채우세요. 확실하지 않으면 비워두세요.
   * (팀 CLAUDE.md §7② — 법령·통계를 지어내면 발표에서 무너집니다)
   */
  knowledge: string;
  /** 요청 문구의 수신자 (예: '중개사', '사장님/인사담당자') */
  requestRecipient: string;
  /** 공식 확인 경로 */
  officialChannels: string[];
}

const PACKS: Record<DocType, KnowledgePack> = {
  lease: leasePack,
  labor: laborPack,
  terms: termsPack,
  message: smishingPack,
};

export function getKnowledgePack(docType: DocType): KnowledgePack {
  return PACKS[docType];
}
