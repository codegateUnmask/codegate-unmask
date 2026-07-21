'use client';

// 진단 결과(취약 유형)를 계정 단위로 정리합니다. [담당: 지식·데이터·인프라(D)]
//
// 문제: 진단 결과가 localStorage(기기 단위)에만 있어서, 예전에 이 브라우저에서
//       진단한 유형이 "방금 처음 로그인한 다른 계정"의 /me 에 그대로 떴습니다.
//
// 규칙:
//   · 방금 진단하고 바로 로그인한 흐름(sessionStorage 플래그) → 그 계정이 이어받음
//     (진단(비로그인) → 판독하러 로그인 하는 정상 퍼널을 끊지 않기 위해)
//   · 그 외에 로그인 계정과 소유자가 다르면 → 지움
//     (공용 PC에서 남의 취약 유형이 보이는 건 그 자체로 개인정보 노출)
//   · 비로그인 상태는 건드리지 않음 (anon 결과는 이 기기 것)

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { ANON_OWNER, FRESH_DIAGNOSIS_KEY, identityKey } from './identity';

export default function ProfileScopeSync() {
  const { data: session, status } = useSession();
  const profile = useAppStore((s) => s.profile);
  const profileOwner = useAppStore((s) => s.profileOwner);
  const adoptProfile = useAppStore((s) => s.adoptProfile);
  const clearProfile = useAppStore((s) => s.clearProfile);

  useEffect(() => {
    if (status !== 'authenticated' || !profile) return;
    const me = identityKey(session);
    if (!me) return;

    const owner = profileOwner ?? ANON_OWNER; // 소유자 필드가 없던 시절 데이터는 anon 취급
    if (owner === me) return;

    if (owner === ANON_OWNER && sessionStorage.getItem(FRESH_DIAGNOSIS_KEY) === '1') {
      // 방금 이 탭에서 진단하고 로그인한 사람 — 결과를 계정으로 이어받습니다.
      sessionStorage.removeItem(FRESH_DIAGNOSIS_KEY);
      adoptProfile(me);
      return;
    }

    // 다른 계정(또는 출처를 알 수 없는 옛 데이터)의 결과 — 이 계정에는 보여주지 않습니다.
    clearProfile();
  }, [status, session, profile, profileOwner, adoptProfile, clearProfile]);

  return null;
}
