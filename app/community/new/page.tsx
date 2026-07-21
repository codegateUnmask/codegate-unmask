'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import { useSession } from 'next-auth/react';
import LoginSheet from '@/components/auth/LoginSheet';
import { useCommunityStore } from '@/stores/communityStore';
import { DOC_TYPE_TAGS, type CommunityPost } from '@/lib/mock.community';
import styles from '../community.module.css';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function CommunityNewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const addPost = useCommunityStore((s) => s.addPost);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [kind, setKind] = useState<CommunityPost['kind']>('report');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [docTypeTag, setDocTypeTag] = useState<string | undefined>(undefined);

  useEffect(() => {
    // 세션 확인이 끝나고 '로그인 안 됨'이 확정됐을 때만 띄웁니다.
    if (status === 'unauthenticated') setIsSheetOpen(true);
  }, [status]);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addPost({ kind, title: title.trim(), body: body.trim(), docTypeTag });
    router.push('/community');
  }

  return (
    <main className={styles.screen}>
      <div className={styles.topbar}>
        <Link href="/community" className={styles.backButton} aria-label="커뮤니티 목록으로 돌아가기">
          <BackIcon />
        </Link>
        <h1 className={styles.topbarTitle}>수법 제보하기</h1>
        <span aria-hidden="true" />
      </div>

      {status === 'loading' ? null : user ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <p className={styles.fieldLabel}>글 종류</p>
            <SegmentedControl
              value={kind}
              onChange={(v) => setKind(v as CommunityPost['kind'])}
              label="글 종류"
              layout="fill"
            >
              <SegmentedControlItem value="report" label="제보" />
              <SegmentedControlItem value="story" label="후기" />
            </SegmentedControl>
          </div>

          <TextInput
            label="제목"
            isRequired
            value={title}
            onChange={setTitle}
            placeholder="예: 택배 사칭 문자 조심하세요"
          />

          <TextArea
            label="내용"
            isRequired
            rows={7}
            value={body}
            onChange={setBody}
            placeholder="어떤 수법이었는지, 어떻게 알아챘는지 구체적으로 적어주세요. 전화번호·계좌 등 개인정보는 적지 마세요."
          />

          <div>
            <p className={styles.fieldLabel} id="doc-type-label">
              관련 분야 (선택)
            </p>
            <div className={styles.chipRow} role="group" aria-labelledby="doc-type-label">
              {DOC_TYPE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={styles.chip}
                  aria-pressed={docTypeTag === tag}
                  onClick={() => setDocTypeTag((current) => (current === tag ? undefined : tag))}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button label="등록하기" variant="primary" type="submit" width="100%" isDisabled={!canSubmit} />
        </form>
      ) : (
        <div className={styles.gate}>
          <span className={styles.gateIcon}>
            <LockIcon />
          </span>
          <p className={styles.gateTitle}>로그인이 필요해요</p>
          <p className={styles.gateDescription}>
            제보와 후기는 로그인 후 작성할 수 있어요.
            <br />
            카카오·구글·네이버 또는 닉네임만으로 바로 시작할 수 있습니다.
          </p>
          <Button label="로그인하기" variant="primary" onClick={() => setIsSheetOpen(true)} />
        </div>
      )}

      <LoginSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </main>
  );
}
