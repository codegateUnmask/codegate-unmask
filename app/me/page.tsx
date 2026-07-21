'use client';

import { useState } from 'react';
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
import ProfileEditor from '@/components/profile/ProfileEditor';
import HistoryDetail from '@/components/me/HistoryDetail';
import { useProfileStore } from '@/stores/profileStore';
import { useHistoryStore, type ScanRecord } from '@/stores/historyStore';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { KNOWLEDGE_PACKS } from '@/lib/config';
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
  const { data: session, status } = useSession();
  const user = session?.user;
  const profile = useAppStore((s) => s.profile);
  const toast = useToast();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openRecord, setOpenRecord] = useState<ScanRecord | null>(null);
  // 표시 이름·사진은 이 기기에만 저장한 값을 우선합니다 (없으면 세션 값)
  const localName = useProfileStore((s) => s.nickname);
  const localAvatar = useProfileStore((s) => s.avatar);
  // 판독 기록 — 이 기기(localStorage)에만 저장된 실제 데이터
  const records = useHistoryStore((s) => s.records);

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
              label="로그인하기"
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

  const displayName = localName ?? user.name ?? '사용자';

  return (
    <main className={styles.page} aria-label="마이페이지">
      <h1 className="sr-only">마이페이지</h1>

      <header className={styles.profile}>
        {localAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 대상이 아닙니다
          <img
            src={localAvatar}
            alt=""
            width={64}
            height={64}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' }}
          />
        ) : (
          <Avatar name={displayName} size="large" />
        )}
        <div>
          <p className={styles.name}>{displayName}</p>
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
            {profile.typeCode && (
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
          <Badge label="내 기기에만 저장" />
        </div>
        {records.length === 0 ? (
          <EmptyState
            isCompact
            title="아직 판독 기록이 없어요"
            description="계약서나 문자를 판독하면 결과가 여기에 남아요. 서버가 아니라 이 기기에만 저장돼요."
            actions={<Button label="계약서 판독하러 가기" variant="primary" href="/scan" />}
          />
        ) : (
          <List hasDividers density="spacious">
            {records.map((item) => (
              <ListItem
                key={item.id}
                label={KNOWLEDGE_PACKS[item.docType]?.label ?? item.docType}
                description={item.result.summary}
                endContent={
                  <span className={styles.histEnd}>
                    <Badge
                      variant={LEVEL_BADGE[item.result.overallLevel]}
                      label={LEVEL_LABEL[item.result.overallLevel]}
                    />
                    <span className={styles.histDate}>
                      {new Date(item.ts).getMonth() + 1}월 {new Date(item.ts).getDate()}일
                    </span>
                  </span>
                }
                onClick={() => setOpenRecord(item)}
              />
            ))}
          </List>
        )}
      </section>

      <section className={styles.section} aria-labelledby="me-settings-title">
        <h2 id="me-settings-title" className={styles.sectionTitle}>
          설정
        </h2>
        <List hasDividers density="spacious">
          <ListItem label="프리미엄 구독" onClick={() => router.push('/premium')} />
          <ListItem label="프로필 편집" onClick={() => setIsEditOpen(true)} />
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

      {isEditOpen && (
        <ProfileEditor fallbackName={user.name ?? '사용자'} onClose={() => setIsEditOpen(false)} />
      )}
      {openRecord && <HistoryDetail record={openRecord} onClose={() => setOpenRecord(null)} />}
    </main>
  );
}
