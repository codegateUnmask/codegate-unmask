'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List, ListItem } from '@astryxdesign/core/List';
import { useToast } from '@astryxdesign/core/Toast';
import LoginSheet from '@/components/auth/LoginSheet';
import { useSession, signOut } from 'next-auth/react';
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

function nextBilling(iso: string): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function MePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const profile = useAppStore((s) => s.profile);
  const toast = useToast();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sub, setSub] = useState<{ since: string } | null>(null);
  const [passes, setPasses] = useState(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem('unmask.subscription');
      if (s) setSub(JSON.parse(s));
      setPasses(Number(localStorage.getItem('unmask.passes') ?? 0));
    } catch {}
  }, []);

  // 세션 확인 전에 로그아웃 화면을 그리면 로그인한 사용자에게 한 번 깜빡입니다.
  if (status === 'loading') return <main className={styles.page} aria-busy="true" />;

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
              label="Google로 로그인"
              variant="primary"
              width="100%"
              onClick={() => setIsSheetOpen(true)}
            />
          </div>
          <p className={styles.guestNote}>지금은 로그인 없이 둘러보는 중이에요</p>
        </section>
        <LoginSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          callbackPath="/start"
        />
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
          {/* 닉네임 체험 입장은 계정이 없어 이메일이 없습니다 */}
          <p className={styles.email}>{user.isGuest ? '닉네임 체험 모드' : user.email}</p>
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
                src={`/${profile.typeCode}.png`}
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

      <section className={styles.card} aria-labelledby="me-sub-title">
        <div className={styles.cardHead}>
          <h2 id="me-sub-title" className={styles.sectionTitle}>
            프리미엄 구독
          </h2>
          {sub && <Badge variant="success" label="프리미엄 이용 중" />}
        </div>
        {sub ? (
          <div className={styles.subBody}>
            <p className={styles.subInfo}>
              다음 결제일 <b>{nextBilling(sub.since)}</b> · 무제한 판독 이용 중
            </p>
            <p className={styles.subInfo}>
              보유 판독권 <b>{passes}건</b>
            </p>
            <Button
              label="관리하기"
              variant="secondary"
              width="100%"
              onClick={() => router.push('/premium')}
            />
          </div>
        ) : (
          <div className={styles.subBody}>
            <p className={styles.subInfo}>프리미엄으로 무제한 판독</p>
            <Button
              label="구독 알아보기"
              variant="primary"
              width="100%"
              onClick={() => router.push('/premium')}
            />
          </div>
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
          <ListItem
            label="알림 설정"
            onClick={() => toast({ body: '준비 중이에요', uniqueID: 'me-settings' })}
          />
          <ListItem
            label="이용약관"
            onClick={() => toast({ body: '준비 중이에요', uniqueID: 'me-settings' })}
          />
          <ListItem label="로그아웃" onClick={() => void signOut({ callbackUrl: '/' })} />
        </List>
      </section>

      <p className={styles.version}>ClearGuard demo v0.1</p>
    </main>
  );
}
