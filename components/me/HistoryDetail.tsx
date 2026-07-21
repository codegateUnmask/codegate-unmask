'use client';

// 판독 기록 상세 — [담당: 지식·데이터·인프라(D)]
// localStorage에 남긴 ScanRecord 하나를 바텀시트로 다시 보여줍니다.
// 원문 전체는 저장하지 않으므로, 마스킹된 인용(quote)과 리포트 항목만 렌더합니다.

import { Badge } from '@astryxdesign/core/Badge';
import { KNOWLEDGE_PACKS, RISK_LABEL } from '@/lib/config';
import type { ScanRecord } from '@/stores/historyStore';
import type { RiskLevel } from '@/lib/types';
import styles from './HistoryDetail.module.css';

const LEVEL_BADGE: Record<RiskLevel, 'error' | 'warning' | 'success'> = {
  danger: 'error',
  warning: 'warning',
  safe: 'success',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface Props {
  record: ScanRecord;
  onClose: () => void;
}

export default function HistoryDetail({ record, onClose }: Props) {
  const { result } = record;
  const docLabel = KNOWLEDGE_PACKS[record.docType]?.label ?? record.docType;

  const extraSections: Array<{ title: string; items: string[] }> = [
    { title: '상대방에게 요청할 문구', items: result.requestPhrases },
    { title: '빠진 서류', items: result.missingDocuments },
    { title: '이 문서만으로 확인 불가', items: result.unverifiable },
    { title: '공식 확인 경로', items: result.officialChannels },
    { title: '전문가 검토가 필요한 부분', items: result.needsExpertReview },
  ];

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="판독 기록 상세"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.head}>
          <h2 className={styles.title}>{docLabel} 분석 결과</h2>
          <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.meta}>
          <Badge variant={LEVEL_BADGE[result.overallLevel]} label={RISK_LABEL[result.overallLevel]} />
          <span>{formatDate(record.ts)} 판독</span>
        </div>

        <p className={styles.summary}>{result.summary}</p>

        {result.findings.map((f) => (
          <div key={f.id} className={styles.finding} data-level={f.level}>
            <Badge variant={LEVEL_BADGE[f.level]} label={RISK_LABEL[f.level]} />
            {f.quote && <p className={styles.quote}>“{f.quote}”</p>}
            <p className={styles.reason}>{f.reason}</p>
            {f.action && <p className={styles.action}>→ {f.action}</p>}
          </div>
        ))}

        {extraSections
          .filter((s) => s.items && s.items.length > 0)
          .map((s) => (
            <div key={s.title}>
              <h3 className={styles.sectionTitle}>{s.title}</h3>
              <ul className={styles.list}>
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

        <p className={styles.note}>이 기록은 서버가 아니라 내 기기에만 저장돼요.</p>
      </div>
    </div>
  );
}
