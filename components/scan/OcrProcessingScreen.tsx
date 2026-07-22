'use client';

import styles from './OcrProcessingScreen.module.css';
import { ClearGuardLogo } from '@/components/brand/ClearGuardLogo';

export type OcrProcessingStage = 'quality' | 'extract' | 'verify';

const STAGES: { key: OcrProcessingStage; label: string }[] = [
  { key: 'quality', label: '이미지 품질 확인 중' },
  { key: 'extract', label: '한국어 텍스트 추출 중' },
  { key: 'verify', label: '금액·날짜·위약금 등 핵심 항목 확인 중' },
];

function CloseIcon() {
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
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      aria-hidden="true"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 16.5h6" />
    </svg>
  );
}

export interface OcrProcessingScreenProps {
  fileName: string;
  stage: OcrProcessingStage;
  onChangeImage: () => void;
  onCancel: () => void;
}

export function OcrProcessingScreen({
  fileName,
  stage,
  onChangeImage,
  onCancel,
}: OcrProcessingScreenProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.iconButton} aria-hidden="true" />
        <h1 className={styles.logo}><ClearGuardLogo size={26} asHomeLink /></h1>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onCancel}
          aria-label="인식 취소"
        >
          <CloseIcon />
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <h2>계약서를 읽고 있어요.</h2>
          <p>사진에서 텍스트를 추출하는 동안 잠시만 기다려 주세요.</p>
        </section>

        <section className={styles.fileCard} aria-label="처리 중인 파일">
          <span className={styles.fileIcon}>
            <DocumentIcon />
          </span>
          <span className={styles.fileName}>{fileName}</span>
          <button type="button" className={styles.changeImage} onClick={onChangeImage}>
            다른 이미지 선택
          </button>
          <p className={styles.changeImageHint}>선택하면 지금 진행 중인 인식은 취소됩니다.</p>
        </section>

        <ol className={styles.stageList} aria-label="인식 진행 단계">
          {STAGES.map((item, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <li
                key={item.key}
                className={active ? styles.stageActive : done ? styles.stageDone : styles.stage}
                aria-current={active ? 'step' : undefined}
              >
                <span className={styles.stageMark} aria-hidden="true">
                  {done ? (
                    <CheckIcon />
                  ) : active ? (
                    <span className={styles.spinner} />
                  ) : (
                    <span className={styles.dot} />
                  )}
                </span>
                <span className={styles.stageLabel}>
                  {item.label}
                  {done && <span className={styles.srOnly}> (완료)</span>}
                  {active && <span className={styles.srOnly}> (진행 중)</span>}
                </span>
              </li>
            );
          })}
        </ol>

        <p className={styles.privacyNote}>이미지는 브라우저 안에서만 처리되며 서버로 전송되지 않습니다.</p>
      </main>
    </div>
  );
}

export default OcrProcessingScreen;
