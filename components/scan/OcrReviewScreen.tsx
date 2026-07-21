'use client';

import styles from './OcrReviewScreen.module.css';

const ICON_PATHS = {
  security: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 2.18 7 3.11V11c0 4.52-2.98 8.69-7 9.93C7.98 19.69 5 15.52 5 11V6.29l7-3.11Z',
  notifications: 'M12 22a2.2 2.2 0 0 0 2.2-2h-4.4A2.2 2.2 0 0 0 12 22Zm7-5v-5.5c0-3.07-1.64-5.64-4.5-6.32V4.5a2.5 2.5 0 0 0-5 0v.68C6.63 5.86 5 8.42 5 11.5V17l-2 2v1h18v-1l-2-2Zm-2 1H7v-6.5C7 8.46 8.79 7 12 7s5 1.46 5 4.5V18Z',
  check: 'M12 2a10 10 0 1 0 .01 20.01A10 10 0 0 0 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9Z',
  scanner: 'M4 7V4h3V2H4a2 2 0 0 0-2 2v3h2Zm13-5v2h3v3h2V4a2 2 0 0 0-2-2h-3Zm3 15v3h-3v2h3a2 2 0 0 0 2-2v-3h-2ZM7 20H4v-3H2v3a2 2 0 0 0 2 2h3v-2Zm-1-5h12V9H6v6Zm2-4h8v2H8v-2Z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79Z',
  arrow: 'm12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z',
} as const;

const DEFAULT_FILE_NAME = '부동산 임대차 계약서.jpg';

function Icon({ name, size = 20 }: { name: keyof typeof ICON_PATHS; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function SampleContractText() {
  return (
    <>
      <p><strong>제 1 조 (목적)</strong><br />본 계약은 임대인과 임차인 쌍방이 아래 표시 부동산에 관하여 다음 내용과 같이 임대차계약을 체결한다.</p>
      <p><strong>제 2 조 (부동산의 표시)</strong><br />소재지 : 서울특별시 강남구 테헤란로 123, 45층 4501호<br />면적 : 85.00 ㎡</p>
      <p><strong>제 3 조 (보증금 및 지급시기)</strong><br />임대차 <mark className={styles.errorHighlight}>보중금음</mark> 금 삼억원정 (₩ 300,000,000)으로 하며, 다음과 같이 지급한다.<br />1. 계약금 : 금 삼천만원정 (₩ 30,000,000)은 계약 시에 지불한다.<br />2. 잔금 : 금 이억칠천만원정 (₩ 270,000,000)은 <mark className={styles.warningHighlight}>2024년 10월 31일</mark>에 지불한다.</p>
      <p><strong>제 4 조 (존속기간)</strong><br />임대인은 위 부동산을 임대차 목적대로 사용, 수익할 수 있는 상태로 2024년 10월 31일까지 임차인에게 인도하며, 임대차 기간은 인도일로부터 24개월로 한다.</p>
      <p><strong>제 5 조 (계약의 해제)</strong><br />임차인이 임대인에게 중도금(중도금이 없을 때는 잔금)을 지불하기 전까지, 임대인은 계약금의 배액을 상환하고, 임차인은 계약금을 포기하고 본 계약을 해제할 수 있다.</p>
      <p><strong>제 6 조 (특약사항)</strong><br />1. 반려동물 사육은 <mark className={styles.errorHighlight}>엄격히 금지</mark>하며, 적발 시 즉각 퇴거 조치한다.<br />2. 기본 시설물 파손 시 임차인이 원상복구 비용을 전액 부담한다.</p>
    </>
  );
}

export interface OcrReviewScreenProps {
  fileName?: string;
  text?: string;
}

export function OcrReviewScreen({ fileName = DEFAULT_FILE_NAME, text }: OcrReviewScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.iconButton} type="button" aria-label="보안 화면으로 돌아가기">
          <Icon name="security" size={24} />
        </button>
        <h1 className={styles.logo}>unmask</h1>
        <button className={styles.iconButton} type="button" aria-label="알림">
          <Icon name="notifications" size={24} />
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="ocr-review-title">
          <div className={styles.stepChip}>
            <Icon name="check" size={18} />
            <span>1단계: 텍스트 추출 완료</span>
          </div>
          <h2 id="ocr-review-title">추출된 내용을 확인해 주세요.</h2>
          <p>오타가 있거나 인식이 잘못된 부분이 있다면 수정할 수 있습니다. 형광펜으로 칠해진 부분은 인식이 부정확할 수 있습니다.</p>
        </section>

        <section className={styles.documentCard} aria-label="추출된 계약서 내용">
          <div className={styles.documentHeader}>
            <div className={styles.fileName}>
              <Icon name="scanner" size={18} />
              <span>{fileName}</span>
            </div>
            <button className={styles.editButton} type="button">
              <Icon name="edit" size={18} />
              <span>직접 수정</span>
            </button>
          </div>
          <div className={styles.documentText} role="textbox" aria-label="OCR로 추출된 계약서 텍스트" aria-readonly="true">
            {text ? <p className={styles.customText}>{text}</p> : <SampleContractText />}
          </div>
        </section>
      </main>

      <footer className={styles.actions}>
        <button className={styles.primaryAction} type="button">
          <span>이대로 분석하기</span>
          <Icon name="arrow" size={20} />
        </button>
        <button className={styles.secondaryAction} type="button">내용 수정하기</button>
      </footer>
    </div>
  );
}

export default OcrReviewScreen;
