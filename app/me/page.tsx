'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ShieldCheck } from 'lucide-react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List, ListItem } from '@astryxdesign/core/List';
import { useToast } from '@astryxdesign/core/Toast';
import { useAppStore } from '@/lib/store';
import { MOCK_SCAN_HISTORY } from '@/lib/mock.me';
import type { RiskLevel } from '@/lib/types';
import styles from './Me.module.css';

const LEVEL_BADGE: Record<RiskLevel, 'error' | 'warning' | 'success'> = {
  danger: 'error',
  warning: 'warning',
  safe: 'success',
};

const LEVEL_LABEL: Record<RiskLevel, string> = {
  danger: '위험',
  warning: '주의',
  safe: '안전',
};

export default function MePage() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const profile = useAppStore((s) => s.profile);
  const toast = useToast();
  const router = useRouter();

  if (!user) {
    return (
      <main className={styles.page} aria-label="마이페이지">
        <section className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">
            <ShieldCheck size={36} strokeWidth={2} />
          </span>
          <h1 className={styles.heroTitle}>로그인하고 내 기록을 모아보세요</h1>
          <p className={styles.heroDesc}>진단 결과와 계약서 분석 기록이 한곳에 저장돼요.</p>
          <div className={styles.heroAction}>
            <Button
              label="로그인하기"
              variant="primary"
              width="100%"
              onClick={() => router.push('/login?callbackUrl=/start')}
            />
          </div>
          <p className={styles.guestNote}>지금은 로그인 없이 둘러보는 중이에요</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page} aria-label="마이페이지">
      <h1 className="sr-only">마이페이지</h1>

      <header className={styles.profile}>
        <Avatar name={user.name ?? '사용자'} size="large" />
        <div>
          <p className={styles.name}>{user.name ?? '사용자'}</p>
          <p className={styles.email}>{user.email ?? '체험 모드'}</p>
        </div>
      </header>

      <section className={styles.card} aria-labelledby="me-vuln-title">
        <div className={styles.cardHead}>
          <h2 id="me-vuln-title" className={styles.sectionTitle}>
            내 사기 취약 유형
          </h2>
          {profile && (
            <Link href="/diagnose" className={styles.retry}>
              다시 진단하기
            </Link>
          )}
        </div>
        {profile ? (
          <div className={styles.profileBody}>
            {profile.mbtiMatch && (
              <Image
                src={`/${profile.mbtiMatch}.png`}
                alt=""
                width={72}
                height={72}
                className={styles.thumb}
              />
            )}
            <div>
              <p className={styles.typeName}>{profile.characterTitle ?? profile.typeName}</p>
              <p className={styles.tagline}>{profile.tagline}</p>
              <div className={styles.chips}>
                {profile.mbtiMatch && <span className={styles.mbtiChip}>{profile.mbtiMatch}</span>}
                {profile.weakAgainst.slice(0, 2).map((w) => (
                  <span key={w} className={styles.weakChip}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            isCompact
            title="아직 진단하지 않았어요"
            description="1분이면 내가 어떤 사기에 약한지 알 수 있어요."
            actions={<Button label="1분 진단하러 가기" variant="primary" href="/diagnose" />}
          />
        )}
      </section>

      <section className={styles.section} aria-labelledby="me-history-title">
        <div className={styles.sectionHead}>
          <h2 id="me-history-title" className={styles.sectionTitle}>
            분석 히스토리
          </h2>
          <Badge label="목업 데이터" />
        </div>
        <List hasDividers density="spacious">
          {MOCK_SCAN_HISTORY.map((item) => (
            <ListItem
              key={item.id}
              label={item.docTypeLabel}
              description={item.summary}
              endContent={
                <span className={styles.histEnd}>
                  <Badge variant={LEVEL_BADGE[item.level]} label={LEVEL_LABEL[item.level]} />
                  <span className={styles.histDate}>{item.date}</span>
                </span>
              }
              onClick={() =>
                toast({ body: '데모에서는 상세 보기를 제공하지 않아요', uniqueID: 'me-history' })
              }
            />
          ))}
        </List>
      </section>

      <section className={styles.section} aria-labelledby="me-settings-title">
        <h2 id="me-settings-title" className={styles.sectionTitle}>
          설정
        </h2>
        <List hasDividers density="spacious">
          <ListItem label="프리미엄 구독" onClick={() => router.push('/premium')} />
          <ListItem
            label="알림 설정"
            onClick={() => toast({ body: '준비 중이에요', uniqueID: 'me-settings' })}
          />
          <ListItem
            label="이용약관"
            onClick={() => toast({ body: '준비 중이에요', uniqueID: 'me-settings' })}
          />
          <ListItem label="로그아웃" onClick={() => void signOut({ callbackUrl: '/me' })} />
        </List>
      </section>

      <p className={styles.version}>unmask demo v0.1</p>
    </main>
  );
}
