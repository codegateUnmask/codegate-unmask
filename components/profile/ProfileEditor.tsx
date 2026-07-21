'use client';

// 프로필 편집(표시 이름·사진) — [담당: 지식·데이터·인프라(D)]
//
// DB가 없으므로 이 기기에만 저장합니다. 서버로 올라가지 않습니다.
// 소셜 계정 정보를 바꾸는 것이 아니라 화면 표시만 바꿉니다.

import { useRef, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { toAvatarDataUrl, useProfileStore } from '@/stores/profileStore';
import styles from './ProfileEditor.module.css';

interface Props {
  /** 세션에서 온 원래 이름 — 사용자가 지운 경우 여기로 돌아갑니다 */
  fallbackName: string;
  onClose: () => void;
}

export default function ProfileEditor({ fallbackName, onClose }: Props) {
  const nickname = useProfileStore((s) => s.nickname);
  const avatar = useProfileStore((s) => s.avatar);
  const setNickname = useProfileStore((s) => s.setNickname);
  const setAvatar = useProfileStore((s) => s.setAvatar);

  const [draftName, setDraftName] = useState(nickname ?? fallbackName);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(avatar);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      setDraftAvatar(await toAvatarDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지를 불러오지 못했어요');
    } finally {
      // 같은 파일을 다시 골라도 change가 나도록 초기화
      e.target.value = '';
    }
  }

  function handleSave() {
    const name = draftName.trim();
    if (name.length > 20) {
      setError('이름은 20자까지 쓸 수 있어요');
      return;
    }
    // 원래 이름과 같으면 굳이 저장하지 않습니다(세션 이름을 그대로 따르게)
    setNickname(name && name !== fallbackName ? name : null);
    setAvatar(draftAvatar);
    onClose();
  }

  const preview = draftAvatar;
  const initial = (draftName.trim() || fallbackName).charAt(0);

  return (
    <div className={styles.backdrop} role="dialog" aria-label="프로필 편집" aria-modal="true">
      <div className={styles.sheet}>
        <div className={styles.head}>
          <h2 className={styles.title}>프로필 편집</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className={styles.close}>
            ×
          </button>
        </div>

        <div className={styles.avatarRow}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={() => fileRef.current?.click()}
            aria-label="프로필 사진 변경"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 최적화 대상이 아닙니다
              <img src={preview} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitial}>{initial}</span>
            )}
            <span className={styles.avatarBadge} aria-hidden="true">
              📷
            </span>
          </button>
          <div className={styles.avatarActions}>
            <button type="button" className={styles.linkButton} onClick={() => fileRef.current?.click()}>
              사진 변경
            </button>
            {preview && (
              <button
                type="button"
                className={styles.linkButtonMuted}
                onClick={() => setDraftAvatar(null)}
              >
                기본 이미지로
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className={styles.hiddenInput}
          />
        </div>

        <label className={styles.label} htmlFor="profile-name">
          표시 이름
        </label>
        <input
          id="profile-name"
          className={styles.input}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          maxLength={20}
          placeholder={fallbackName}
          autoComplete="off"
        />
        <p className={styles.hint}>
          이 기기에만 저장돼요. 서버로 올라가지 않습니다.
        </p>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            취소
          </button>
          <div className={styles.saveWrap}>
            <Button label="저장" variant="primary" width="100%" onClick={handleSave} />
          </div>
        </div>
      </div>
    </div>
  );
}
