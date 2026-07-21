'use client';

import styles from './RecaptureScreen.module.css';

export type RecaptureReason =
  | 'blur'
  | 'low-resolution'
  | 'no-text'
  | 'corrupt'
  | 'unsupported'
  | 'model-load-failed';

const REASON_COPY: Record<RecaptureReason, { title: string; description: string }> = {
  blur: {
    title: '계약서 글자를 정확히 읽기 어려워요.',
    description: '밝은 곳에서 계약서 전체가 보이도록 정면에서 다시 촬영해 주세요.',
  },
  'low-resolution': {
    title: '사진 해상도가 너무 낮아요.',
    description: '더 선명한 원본 크기 이미지를 선택하거나, 가까이에서 다시 촬영해 주세요.',
  },
  'no-text': {
    title: '사진에서 글자를 찾지 못했어요.',
    description: '계약서 문서가 화면에 담기도록 정면에서 다시 촬영해 주세요.',
  },
  corrupt: {
    title: '이미지 파일을 열 수 없어요.',
    description: '파일이 손상된 것 같아요. 다시 촬영하거나 다른 이미지를 선택해 주세요.',
  },
  unsupported: {
    title: '지원하지 않는 파일 형식이에요.',
    description: 'JPG 또는 PNG 형식의 이미지로 다시 시도해 주세요.',
  },
  'model-load-failed': {
    title: '문자 인식 기능을 불러오지 못했어요.',
    description: '네트워크 연결을 확인하고 다시 시도하거나, 텍스트로 직접 입력해 주세요.',
  },
};

const GUIDE_ITEMS = [
  '문서 전체가 프레임 안에 들어오게 해 주세요.',
  '그림자나 빛 반사를 피해 주세요.',
  '카메라를 계약서와 평행하게 맞춰 주세요.',
];

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 6-6 6 6 6M5 12h14" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </svg>
  );
}

function GuideCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export interface RecaptureScreenProps {
  reason: RecaptureReason;
  onRetake: () => void;
  onPickAnother: () => void;
  onTypeInstead: () => void;
  onBack: () => void;
}

export function RecaptureScreen({
  reason,
  onRetake,
  onPickAnother,
  onTypeInstead,
  onBack,
}: RecaptureScreenProps) {
  const copy = REASON_COPY[reason];

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onBack}
          aria-label="이전 화면으로"
        >
          <BackIcon />
        </button>
        <h1 className={styles.logo}>ClearGuard</h1>
        <span className={styles.iconButton} aria-hidden="true" />
      </header>

      <main className={styles.main}>
        <section className={styles.notice} role="alert">
          <span className={styles.noticeIcon}>
            <AlertIcon />
          </span>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </section>

        <section className={styles.guideCard} aria-labelledby="recapture-guide-title">
          <h3 id="recapture-guide-title">촬영 가이드</h3>
          <ul>
            {GUIDE_ITEMS.map((item) => (
              <li key={item}>
                <span className={styles.guideIcon}>
                  <GuideCheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryAction} onClick={onRetake}>
            다시 촬영하기
          </button>
          <button type="button" className={styles.secondaryAction} onClick={onPickAnother}>
            다른 이미지 선택
          </button>
          <button type="button" className={styles.textAction} onClick={onTypeInstead}>
            텍스트로 직접 입력하기
          </button>
        </div>
      </main>
    </div>
  );
}

export default RecaptureScreen;
