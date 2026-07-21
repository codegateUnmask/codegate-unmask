'use client';

// 로그인 게이트 — [담당: 지식·데이터·인프라(D)]
// 여기서 직접 로그인시키지 않고 /login 으로 보냅니다.
// 소셜 버튼은 "환경변수가 있는 프로바이더만" 띄워야 하는데(auth.ts),
// 그 판단은 서버에서만 가능해서 로그인 화면 한 곳에만 두고 재사용합니다.

import { usePathname, useRouter } from 'next/navigation';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Button } from '@astryxdesign/core/Button';
import styles from './LoginSheet.module.css';

export interface LoginSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** 로그인 후 돌아올 경로. 비우면 지금 보고 있는 화면으로 돌아옵니다. */
  callbackPath?: string;
}

export default function LoginSheet({ isOpen, onOpenChange, callbackPath }: LoginSheetProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogin() {
    onOpenChange(false);
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath ?? pathname)}`);
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={360}>
      <div className={styles.body}>
        <h2 className={styles.title}>ClearGuard 시작하기</h2>
        <p className={styles.description}>
          로그인하면 진단 결과와 분석 기록이 계정에 연결됩니다.
        </p>
        <Button label="로그인하러 가기" variant="primary" width="100%" onClick={handleLogin} />
        <Button label="다음에 할게요" variant="ghost" width="100%" onClick={() => onOpenChange(false)} />
        <p className={styles.notice}>카카오·구글·네이버 또는 닉네임만으로 체험할 수 있어요.</p>
      </div>
    </Dialog>
  );
}
