// ============================================================
// 카카오페이 결제 준비 (테스트 결제 — cid TC0ONETIME, 실과금 없음)  [담당: B]
// KAKAOPAY_SECRET_KEY(.env.local)가 없으면 { demo: true }를 돌려주고
// 화면이 목업 흐름으로 폴백한다 — 데모가 죽지 않게.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const READY_URL = 'https://open-api.kakaopay.com/online/v1/payment/ready';
const CID = 'TC0ONETIME'; // 카카오페이 공식 테스트 가맹점 코드

export async function POST(req: NextRequest) {
  const secret = process.env.KAKAOPAY_SECRET_KEY;
  const { planId, itemName, amount, orderId } = await req.json();

  if (!secret) return NextResponse.json({ demo: true }); // 키 없음 → 목업 폴백

  const origin = req.headers.get('origin') ?? new URL(req.url).origin;
  const back = `${origin}/premium/kakao?plan=${encodeURIComponent(planId)}`;

  try {
    const res = await fetch(READY_URL, {
      method: 'POST',
      headers: {
        Authorization: `SECRET_KEY ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cid: CID,
        partner_order_id: orderId,
        partner_user_id: 'unmask-demo-user',
        item_name: itemName,
        quantity: 1,
        total_amount: amount,
        tax_free_amount: 0,
        approval_url: `${back}&result=success`, // 카카오가 &pg_token=...을 붙여줌
        cancel_url: `${back}&result=cancel`,
        fail_url: `${back}&result=fail`,
      }),
    });
    if (!res.ok) { console.error('KAKAO READY FAIL', res.status, await res.text()); return NextResponse.json({ demo: true }); }
    const data = await res.json();
    return NextResponse.json({
      demo: false,
      tid: data.tid,
      redirectPc: data.next_redirect_pc_url,
      redirectMobile: data.next_redirect_mobile_url,
    });
  } catch {
    return NextResponse.json({ demo: true });
  }
}
