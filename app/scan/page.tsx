'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { motion } from 'motion/react';
import ScanReport from '@/components/viewer/ScanReport';
import { MOCK_PROFILE } from '@/lib/mock.scan';
import { motionTransition } from '@/lib/ui/motion';
import type { DocType } from '@/lib/types';
import { useScanStore } from '@/stores/scanStore';
import styles from './page.module.css';

type InputMode = 'camera' | 'upload' | 'text';

const MODES: Array<{
  key: InputMode;
  title: string;
  description: string;
  icon: typeof CameraIcon;
}> = [
  {
    key: 'camera',
    title: '사진 촬영',
    description: '종이 계약서를 스마트폰 카메라로 바로 찍어서 분석합니다.',
    icon: CameraIcon,
  },
  {
    key: 'upload',
    title: '이미지 업로드',
    description: '갤러리에 저장된 계약서 캡처본이나 사진을 불러옵니다.',
    icon: ImageIcon,
  },
  {
    key: 'text',
    title: '텍스트 직접 입력',
    description: '확인이 필요한 특정 조항이나 텍스트를 직접 복사하여 붙여넣습니다.',
    icon: TextIcon,
  },
];

const DOC_TYPES: Array<{ key: DocType; label: string }> = [
  { key: 'lease', label: '전월세' },
  { key: 'labor', label: '근로계약' },
  { key: 'terms', label: '약관' },
  { key: 'message', label: '문자' },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.75 27 7v7.7c0 6.65-4.52 12.24-11 14.55C9.52 26.94 5 21.35 5 14.7V7l11-4.25Z" />
      <rect x="11" y="14" width="10" height="8" rx="2" />
      <path d="M13.5 14v-1.5a2.5 2.5 0 0 1 5 0V14" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m4 17 4-4 3 3 3-3 6 5" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6h14M5 12h14M5 18h9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <ShieldIcon />
        </span>
        <span>unmask</span>
      </div>
      <span className={styles.iconButton} aria-hidden="true">
        <BellIcon />
      </span>
    </header>
  );
}

export default function ScanPage() {
  const {
    text,
    docType,
    status,
    stage,
    srcText,
    result,
    error,
    setText,
    setDocType,
    start,
    reset,
  } = useScanStore();
  const [mode, setMode] = useState<InputMode>('camera');
  const [showEditor, setShowEditor] = useState(false);
  const [modeMessage, setModeMessage] = useState<string | null>(null);
  const running = status === 'triage' || status === 'full';

  function continueWithMode() {
    if (mode === 'text') {
      setShowEditor(true);
      return;
    }
    setModeMessage('사진 분석 기능을 준비하고 있습니다. 지금은 텍스트 직접 입력을 이용해 주세요.');
  }

  function newContract() {
    reset();
    setText('');
    setShowEditor(false);
    setMode('camera');
    setModeMessage(null);
  }

  if (running || status === 'done') {
    return (
      <main className={styles.reportShell}>
        <ScanReport status={status} stage={stage} srcText={srcText} result={result} error={error} />
        {status === 'done' && (
          <Button
            label="새 계약서 확인하기"
            variant="secondary"
            width="100%"
            onClick={newContract}
            className={styles.reportReset}
          />
        )}
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <AppHeader />
      {showEditor ? (
        <motion.section
          className={styles.editor}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition}
        >
          <button type="button" className={styles.backButton} onClick={() => setShowEditor(false)}>
            <BackIcon />
            입력 방법 다시 선택
          </button>
          <div className={styles.editorHeading}>
            <h1>계약서 내용을 확인해 주세요.</h1>
            <p>텍스트를 수정한 뒤 판독을 시작할 수 있어요.</p>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.docTypes} role="group" aria-label="문서 종류">
            {DOC_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={docType === item.key ? styles.docTypeActive : styles.docType}
                aria-pressed={docType === item.key}
                onClick={() => setDocType(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className={styles.textField}>
            <span>계약서 내용</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.currentTarget.value)}
              placeholder="계약서 내용을 여기에 붙여넣으세요"
              rows={12}
            />
          </label>
          <Button
            label="판독 시작"
            variant="primary"
            size="lg"
            width="100%"
            isDisabled={!text.trim()}
            onClick={() => void start(MOCK_PROFILE)}
            className={styles.primaryButton}
            style={{ height: 56, borderRadius: 12, fontSize: 16, fontWeight: 700 }}
          />
        </motion.section>
      ) : (
        <motion.section
          className={styles.content}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition}
        >
          <div className={styles.heading}>
            <h1>어떤 방식으로<br />분석할까요?</h1>
            <p>가장 편리한 방법을 선택해 주세요.</p>
          </div>

          <fieldset className={styles.modeGroup}>
            <legend>계약서 입력 방법</legend>
            {MODES.map((item) => {
              const Icon = item.icon;
              const selected = mode === item.key;
              return (
                <motion.label
                  key={item.key}
                  className={selected ? styles.modeCardSelected : styles.modeCard}
                  whileTap={{ scale: 0.99 }}
                  transition={motionTransition}
                >
                  <input
                    type="radio"
                    name="input-mode"
                    value={item.key}
                    checked={selected}
                    onChange={() => {
                      setMode(item.key);
                      setModeMessage(null);
                    }}
                  />
                  <span className={styles.modeIcon}><Icon /></span>
                  <span className={styles.modeCopy}>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </span>
                  <span className={styles.radio} aria-hidden="true" />
                </motion.label>
              );
            })}
          </fieldset>

          {modeMessage && <p className={styles.modeMessage} role="status">{modeMessage}</p>}

          <div className={styles.bottom}>
            <div className={styles.privacy}>
              <span className={styles.privacyIcon}><ShieldIcon /></span>
              <p>계약서 이미지는 서버에 저장되지 않고 브라우저 내에서 안전하게 처리됩니다.</p>
            </div>
            <Button
              label="다음 단계로"
              variant="primary"
              size="lg"
              width="100%"
              onClick={continueWithMode}
              endContent={<span className={styles.arrow}><ArrowIcon /></span>}
              className={styles.primaryButton}
              style={{ height: 56, borderRadius: 12, fontSize: 16, fontWeight: 700 }}
            />
          </div>
        </motion.section>
      )}
    </main>
  );
}
