import Image from 'next/image';
import Link from 'next/link';

export default function BrandPreviewPage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        background: '#f7f8fb',
        color: '#10203a',
        padding: '32px 20px',
      }}
    >
      <section
        style={{
          width: 'min(920px, 100%)',
          borderRadius: 28,
          background: '#fff',
          border: '1px solid rgba(16, 32, 58, 0.08)',
          boxShadow: '0 24px 80px rgba(16, 32, 58, 0.08)',
          padding: '28px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: 12,
            justifyItems: 'center',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a6b85' }}>
            ClearGuard
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.05em' }}>
            Final Brand Preview
          </h1>
          <p style={{ margin: 0, maxWidth: 640, fontSize: 16, lineHeight: 1.6, color: '#5a6b85' }}>
            사이트에 바로 쓸 수 있는 로고 미리보기예요. 아래 이미지는 현재 최종안 기준으로 저장해 둔
            ClearGuard 로고입니다.
          </p>
          <div
            style={{
              width: 'min(100%, 720px)',
              marginTop: 8,
              borderRadius: 24,
              background:
                'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.12), transparent 54%), linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(255,255,255,1))',
              border: '1px solid rgba(16, 32, 58, 0.08)',
              padding: 24,
            }}
          >
            <Image
              src="/clearguard-logo-final.png"
              alt="ClearGuard 최종 로고"
              width={1200}
              height={1200}
              style={{ width: '100%', height: 'auto', borderRadius: 16 }}
              priority
            />
          </div>
          <Link
            href="/"
            style={{
              marginTop: 4,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              padding: '0 18px',
              borderRadius: 999,
              background: '#10203a',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
