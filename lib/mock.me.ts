import type { RiskLevel } from './types';

export interface ScanHistoryItem {
  id: string;
  docTypeLabel: string;
  summary: string;
  level: RiskLevel;
  date: string;
}

export const MOCK_SCAN_HISTORY: ScanHistoryItem[] = [
  {
    id: 'hist-lease',
    docTypeLabel: '전월세 계약서',
    summary: '보증금 반환을 임차인 책임으로 돌리는 특약이 있어요',
    level: 'danger',
    date: '7월 19일',
  },
  {
    id: 'hist-labor',
    docTypeLabel: '근로계약서',
    summary: '수습 기간 급여 감액 조항, 서명 전 확인이 필요해요',
    level: 'warning',
    date: '7월 12일',
  },
  {
    id: 'hist-terms',
    docTypeLabel: '이용약관',
    summary: '표준 약관과 큰 차이 없는 안전한 수준이에요',
    level: 'safe',
    date: '7월 5일',
  },
];
