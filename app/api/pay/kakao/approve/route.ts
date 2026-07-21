// 카카오페이 결제 승인 — ready에서 받은 tid + 결제창에서 돌아온 pg_token으로 확정.
import { NextRequest, NextResponse } from 'next/server';

const APPROVE_URL = 'https://open-api.kakaopay.com/online/v1/payment/approve';
const CID = 'TC0ONETIME';

export async function POST(req: NextRequest) {
  const secret = process.env.KAKAOPAY_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false, reason: 'no-key' }, { status: 400 });

  const { tid, pgToken, orderId } = await req.json();
  try {
    const res = await fetch(APPROVE_URL, {
      method: 'POST',
      headers: {
        Authorization: `SECRET_KEY ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cid: CID,
        tid,
        partner_order_id: orderId,
        partner_user_id: 'unmask-demo-user',
        pg_token: pgToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ ok: false, reason: data?.error_message ?? 'approve-failed' }, { status: 400 });
    return NextResponse.json({ ok: true, aid: data.aid, amount: data.amount?.total });
  } catch {
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 500 });
  }
}
