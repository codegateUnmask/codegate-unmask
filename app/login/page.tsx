// ============================================================
// 로그인 화면 — [담당: 지식·데이터·인프라(D)]
// 소셜 로그인(카카오·구글·네이버) + 닉네임 체험 입장.
// 진단(/diagnose)은 로그인 없이 되므로, 여기서도 그 경로를 열어둡니다.
// ============================================================

import Link from 'next/link';
import { enabledSocialProviders } from '@/auth';
import LoginForm from '@/components/auth/LoginForm';
import styles from './page.module.css';

export const metadata = { title: '로그인 — unmask' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  // 오픈 리다이렉트 방지: 우리 사이트 내부 경로만 허용합니다.
  const raw = params.callbackUrl ?? '/scan';
  const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/scan';

  return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1>계약서 판독을 시작하려면<br />로그인이 필요해요</h1>
          <p>
            판독 1건마다 AI 분석이 들어가서 로그인한 분에게만 제공합니다.
            <br />
            <strong>사기 취약 유형 진단은 로그인 없이</strong> 바로 해보실 수 있어요.
          </p>
        </header>

        {params.error && (
          <p className={styles.error} role="alert">
            로그인에 실패했어요. 다시 시도해 주세요.
          </p>
        )}

        <LoginForm callbackUrl={callbackUrl} social={enabledSocialProviders} />

        <div className={styles.footer}>
          <Link href="/diagnose" className={styles.secondaryLink}>
            먼저 내 사기 취약 유형부터 알아보기 →
          </Link>
          <p className={styles.privacy}>
            로그인 시 이름·이메일만 받아 로그인 유지에 씁니다.
            <br />
            판독한 계약서 내용은 저장하지 않습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
