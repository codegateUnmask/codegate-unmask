'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import styles from './LoginForm.module.css';

interface Props {
  callbackUrl: string;
  social: { kakao: boolean; google: boolean; naver: boolean };
}

const SOCIAL_LABEL = {
  kakao: '카카오로 계속하기',
  google: '구글로 계속하기',
  naver: '네이버로 계속하기',
} as const;

export default function LoginForm({ callbackUrl, social }: Props) {
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasSocial = social.kakao || social.google || social.naver;
  const trimmed = nickname.trim();

  async function handleGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed || busy) return;
    setBusy('guest');
    setError(null);
    const res = await signIn('guest', { nickname: trimmed, redirect: false });
    if (res?.error) {
      setError('닉네임은 1~20자로 입력해 주세요.');
      setBusy(null);
      return;
    }
    // 로그인 성공 — 원래 가려던 곳으로
    window.location.href = callbackUrl;
  }

  return (
    <div className={styles.wrap}>
      {hasSocial && (
        <div className={styles.socialGroup}>
          {(['kakao', 'google', 'naver'] as const)
            .filter((p) => social[p])
            .map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setBusy(p);
                  void signIn(p, { callbackUrl });
                }}
                className={`${styles.socialButton} ${styles[p]}`}
              >
                {busy === p ? '이동 중…' : SOCIAL_LABEL[p]}
              </button>
            ))}
        </div>
      )}

      <div className={styles.divider}>
        <span>{hasSocial ? '또는' : ''}</span>
      </div>

      <form onSubmit={handleGuest} className={styles.guestForm}>
        <label htmlFor="nickname" className={styles.guestLabel}>
          닉네임만 입력하고 바로 체험하기
        </label>
        <div className={styles.guestRow}>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 자취새내기"
            maxLength={20}
            disabled={busy !== null}
            className={styles.guestInput}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!trimmed || busy !== null}
            className={styles.guestButton}
          >
            {busy === 'guest' ? '입장 중…' : '입장'}
          </button>
        </div>
        <p className={styles.guestNote}>
          체험 모드는 계정을 만들지 않습니다. 브라우저를 닫으면 기록이 남지 않아요.
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
