'use client';

// ============================================================
// 입력 안내 배너 — [담당: 지식·데이터(D)]
//
// 두 가지를 알려줍니다.
//   1) 긴급 위협(납치·협박 빙자) — 판독보다 신고가 급한 경우
//   2) 문서 유형 불일치 — 고른 탭과 붙여넣은 내용이 안 맞는 경우
//
// ⚠️ 설계 원칙(2026-07-22 개정): 애매하면(ok/unknown) 막지 않지만,
//    **뚜렷한 불일치(mismatch)는 입력 화면이 판독을 막고** 이 배너의 버튼으로
//    올바른 유형 전환을 안내합니다. 잘못된 카테고리의 판독 결과는
//    정확하지 않은데 정확해 보여서, 안내만 하는 것보다 해롭습니다.
// ============================================================

import type { DocTypeMatch } from '@/lib/knowledge/router';
import type { DocType } from '@/lib/types';
import styles from './InputGuidance.module.css';

const DOC_LABELS: Record<DocType, string> = {
  lease: '전월세',
  labor: '근로계약',
  service: '선불서비스',
  terms: '약관',
  message: '문자',
};

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4.5M12 17h.01" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  );
}

export interface InputGuidanceProps {
  match: DocTypeMatch;
  onSwitch: (docType: DocType) => void;
}

export function InputGuidance({ match, onSwitch }: InputGuidanceProps) {
  const { status, suggested, threat } = match;

  // 긴급이 최우선 — 유형 안내보다 신고 안내를 먼저 보여줍니다.
  if (threat.isEmergency) {
    return (
      <section className={styles.emergency} role="alert">
        <div className={styles.emergencyHead}>
          <span className={styles.emergencyIcon}>
            <AlertIcon />
          </span>
          <h2>지금은 판독보다 신고가 먼저입니다</h2>
        </div>

        <p className={styles.emergencyLead}>
          가족의 신변을 언급하며 돈을 요구하는 협박으로 보입니다. 이런 연락은 대부분
          실제 납치가 아니라 <strong>겁을 주어 송금하게 만드는 수법</strong>입니다.
        </p>

        <ol className={styles.steps}>
          <li>
            <strong>침착하게, 주변에 알리세요.</strong> &ldquo;신고하지 마라&rdquo;는 말은
            혼자 두려고 하는 겁니다.
          </li>
          <li>
            <strong>가족의 안전을 직접 확인하세요.</strong> 옆 사람에게 부탁해 본인 번호나
            학교·학원 등 다른 연락처로 확인하면 대부분 여기서 거짓이 드러납니다.
          </li>
          <li>
            <strong>이미 송금했다면 즉시 112 또는 은행에 지급정지를 신청하세요.</strong>
          </li>
        </ol>

        <div className={styles.callRow}>
          <a className={styles.callPrimary} href="tel:112">
            112 신고
          </a>
          <a className={styles.callSecondary} href="tel:1394">
            피싱안심SOS 1394
          </a>
        </div>

        {status === 'mismatch' && suggested ? (
          <>
            <p className={styles.emergencyFoot}>
              이 내용은 계약서가 아니라 <strong>{DOC_LABELS[suggested]}</strong> 판독 대상입니다.
            </p>
            <button
              type="button"
              className={styles.switchButton}
              onClick={() => onSwitch(suggested)}
            >
              {DOC_LABELS[suggested]} 유형으로 바꾸고 판독하기
            </button>
          </>
        ) : (
          <p className={styles.emergencyFoot}>
            판독은 계속 진행할 수 있지만, 위 확인이 먼저입니다.
          </p>
        )}
      </section>
    );
  }

  if (status === 'mismatch' && suggested) {
    return (
      <section className={styles.mismatch} role="status">
        <span className={styles.mismatchIcon}>
          <SwapIcon />
        </span>
        <div className={styles.mismatchBody}>
          <p className={styles.mismatchText}>
            붙여넣은 내용이 <strong>{DOC_LABELS[suggested]}</strong>에 가까워 보여요.
            지금 유형 그대로 판독하면 결과가 정확하지 않을 수 있습니다.
          </p>
          <button type="button" className={styles.switchButton} onClick={() => onSwitch(suggested)}>
            {DOC_LABELS[suggested]}(으)로 바꾸기
          </button>
        </div>
      </section>
    );
  }

  return null;
}

export default InputGuidance;
