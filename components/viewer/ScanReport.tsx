// [B 담당] 판독 리포트 — 위험도 게이지 + 원문 형광펜 + 개인화 + 카드(위험·주의만)
//          + A의 부가 필드(누락서류·확인불가·요청문구·공식채널·전문가검토)
'use client';

import ClauseCard from './ClauseCard';
import { RISK_LABEL } from '@/lib/config';
import { riskPercent, segmentDoc } from '@/lib/risk';
import type { AnalysisStage, RiskLevel, ScanResult } from '@/lib/types';

const OVERALL: Record<RiskLevel, { chip: string; text: string }> = {
  danger:  { chip: 'bg-[var(--danger)]',  text: '위험한 계약서' },
  warning: { chip: 'bg-[var(--warning)]', text: '주의가 필요한 계약서' },
  safe:    { chip: 'bg-[var(--safe)]',    text: '비교적 안전한 계약서' },
};
const MARK_BG: Record<RiskLevel, string> = {
  danger: 'bg-[var(--danger-hl)]', warning: 'bg-[var(--warning-hl)]', safe: 'bg-[var(--safe-hl)]',
};

interface Props {
  status: 'idle' | 'triage' | 'full' | 'done' | 'error';
  stage: AnalysisStage | null;
  srcText: string;
  result: ScanResult | null;
  error: string | null;
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 font-mono text-[11.5px] font-bold tracking-wider text-[var(--ink-soft)]">{title}</p>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-[14px] leading-relaxed text-[var(--ink)]">· {it}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ScanReport({ status, stage, srcText, result, error }: Props) {
  if (status === 'idle') {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-[15px] leading-relaxed text-[var(--ink-soft)]">
        계약서를 붙여넣고 <b className="text-[var(--ink)]">판독 시작</b>을 누르면<br />
        조항별 판독 결과가 여기에 나타납니다.
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-[var(--danger)] bg-white p-6 text-[15px] text-[var(--danger)]">
        {error ?? '판독 중 문제가 생겼어요. 다시 시도해주세요.'}
      </div>
    );
  }

  const running = status === 'triage' || status === 'full';
  const showFull = stage === 'full';

  if (!result) {
    return (
      <div className="scanline flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--ink)]" />
        <span className="font-mono text-[13.5px] font-bold tracking-wider text-[var(--ink)]">
          SCANNING… 조항을 벗기는 중
        </span>
      </div>
    );
  }

  const { overallLevel, summary, findings } = result;
  const counts = {
    danger: findings.filter((f) => f.level === 'danger').length,
    warning: findings.filter((f) => f.level === 'warning').length,
    safe: findings.filter((f) => f.level === 'safe').length,
  };
  const pct = riskPercent(overallLevel, findings);
  const pctColor = pct >= 65 ? 'var(--danger)' : pct >= 35 ? 'var(--warning)' : 'var(--safe)';
  const explained = findings.filter((f) => f.level !== 'safe');

  return (
    <div className="space-y-4" aria-live="polite">
      {/* 단계 표시 */}
      <div className="scanline flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5">
        <span className={`h-2.5 w-2.5 rounded-full bg-[var(--ink)] ${running ? 'animate-pulse' : ''}`} />
        <span className="font-mono text-[13px] font-bold tracking-wider text-[var(--ink)]">
          {status === 'triage' && '1차 빠른 판독 완료 — 정밀 분석 중…'}
          {status === 'full' && '정밀 판독 완료'}
          {status === 'done' && '판독 완료'}
        </span>
      </div>

      {/* 원문 형광펜 */}
      {srcText && (
        <div className="card-in rounded-2xl border border-[var(--line)] bg-white p-5">
          <h3 className="mb-2.5 text-[15px] font-extrabold text-[var(--ink)]">계약서 원문 — AI 형광펜</h3>
          <p className="whitespace-pre-wrap break-keep text-[15px] leading-[2.05] text-[var(--ink)]">
            {segmentDoc(srcText, findings).map((seg, i) =>
              seg.level ? (
                <mark key={i} className={`hl-sweep box-decoration-clone rounded-[3px] px-1 py-0.5 text-inherit ${MARK_BG[seg.level]}`}>{seg.text}</mark>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
          <p className="mt-2.5 text-[11.5px] text-[var(--ink-soft)]">
            <b className="text-[var(--danger)]">■ 위험</b> · <b className="text-[var(--warning)]">■ 주의</b> · <b className="text-[var(--safe)]">■ 안전</b>
          </p>
        </div>
      )}


      {/* 요약 + 위험도 게이지 */}
      <header className="card-in rounded-2xl border border-[var(--line)] bg-white p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <span className={`rounded-md px-3 py-1 font-mono text-[13px] font-bold tracking-wider text-white ${OVERALL[overallLevel].chip}`}>
            종합 {RISK_LABEL[overallLevel]}
          </span>
          <h2 className="text-[19px] font-extrabold text-[var(--ink)]">{OVERALL[overallLevel].text}</h2>
        </div>
        <div className="my-3 flex items-center gap-4">
          <span className="min-w-[96px] text-[34px] font-extrabold leading-none" style={{ color: pctColor }}>
            {pct}<span className="text-[14px] font-bold text-[var(--ink-soft)]">%</span>
          </span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--paper)]">
            <i className="block h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: pctColor }} />
          </span>
        </div>
        <p className="font-mono text-[11.5px] text-[var(--ink-soft)]">계약서 위험도 — 등급·발견 조항 기반 추정치</p>
        <p className="mt-2.5 text-[15.5px] leading-relaxed text-[var(--ink)]">{summary}</p>
        <p className="mt-2 font-mono text-[13px] text-[var(--ink-soft)]">
          위험 {counts.danger} · 주의 {counts.warning} · 안전 {counts.safe}
        </p>
      </header>

      {/* 개인화 (컷3) */}
      {result.personalized && (
        <div className="card-in rounded-2xl border-2 border-[var(--ink)] bg-white px-5 py-4">
          <p className="mb-1 font-mono text-[12px] font-bold tracking-wider text-[var(--ink-soft)]">내 취약 유형 맞춤 조언</p>
          <p className="text-[15.5px] font-medium leading-relaxed text-[var(--ink)]">{result.personalized}</p>
        </div>
      )}

      {/* 해설 카드 — 위험·주의만 */}
      {explained.map((f) => <ClauseCard key={f.id} finding={f} />)}

      {/* A의 부가 정보 — 정밀(full) 단계에서만 노출 */}
      {showFull && (result.requestPhrases.length > 0 || result.missingDocuments.length > 0 ||
        result.unverifiable.length > 0 || result.officialChannels.length > 0 ||
        result.needsExpertReview.length > 0) && (
        <div className="card-in space-y-3.5 rounded-2xl border border-[var(--line)] bg-white p-5">
          <InfoList title="상대에게 이렇게 요청하세요" items={result.requestPhrases} />
          <InfoList title="추가로 확인할 서류" items={result.missingDocuments} />
          <InfoList title="이 문서만으로 확인 불가" items={result.unverifiable} />
          <InfoList title="전문가 검토가 필요한 부분" items={result.needsExpertReview} />
          <InfoList title="공식 확인 창구" items={result.officialChannels} />
        </div>
      )}

      {status === 'done' && (
        <p className="pt-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
          이 판독은 법률 자문이 아닌 정보 제공입니다. 중요한 결정 전에는 전문가와 상의하세요.
          무료 상담 · 대한법률구조공단 132 · 고용노동부 1350 · 주택임대차분쟁조정위원회
        </p>
      )}
    </div>
  );
}
