# unmask

계약서와 문자에 숨은 위험을 AI가 근거와 함께 벗겨내고, 사용자의 사기 취약 유형을 진단해 훈련시키는 자산 방어 서비스. 코드게이트 AI 스타트업 해커톤 2026 출품작.

## 시작하기

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY 채우기
npm run dev
```

http://localhost:3000 에서 확인. `/diagnose`(진단), `/scan`(판독) 화면이 있습니다.

## 작업 규칙

**`CLAUDE.md`를 먼저 읽으세요.** 만드는 것의 정의, 기술 스택, 파일 구조, 인터페이스 계약(`lib/types.ts`), 담당 역할, 보안 원칙이 전부 여기 있습니다. AI에게 작업을 맡길 때도 이 문서를 먼저 붙여넣으세요.

## 브랜치 · PR 워크플로

- `main`은 항상 데모 가능한 상태로 유지합니다.
- 작업은 `이니셜/기능명` 브랜치(예: `hc/scan-engine`)에서 하고, PR로 `main`에 머지합니다.
- 코어(`lib/engine/`, `lib/types.ts`)는 코어 오너가 머지 책임을 집니다.
- 커밋 전 `git status`로 `.env.local` 등 비밀 파일이 올라가지 않는지 확인하세요.
- PR이 처음이면 `PR가이드.md`를 보세요.

## 배포 — Vercel (GitHub Pages 아님)

**GitHub Pages로는 배포할 수 없습니다.** 이 앱은 `/api/scan`, `/api/diagnose` 같은 서버 API 라우트를 쓰는데 GitHub Pages는 정적 파일만 호스팅합니다. Claude API 키도 서버에서만 써야 하므로(브라우저에 노출되면 키 유출) 서버가 도는 Vercel이 필요합니다.

세팅 순서 (한 번만, 브라우저에서):

1. https://vercel.com 에 **GitHub 계정으로 로그인**
2. **Add New… → Project** → `codegateUnmask/codegate-unmask` 선택 → Import
   - 조직 레포가 안 보이면 "Adjust GitHub App Permissions"에서 `codegateUnmask` 조직 접근 허용
3. Framework는 Next.js로 자동 인식됨 — 빌드 설정 그대로 두기
4. **Environment Variables**에 `ANTHROPIC_API_KEY` 추가 (값은 팀 채팅방에서 받은 키)
5. Deploy

이후에는 `main`에 머지될 때마다 자동 배포되고, **PR을 열 때마다 미리보기 URL이 자동 생성**됩니다. 팀이 서로 코드 안 받고도 화면을 확인할 수 있습니다.

## 데이터베이스 — 현재 쓰지 않습니다

Supabase·Firebase 등 DB를 붙이지 않습니다. 이유:

1. **보안 서사와 직결** — 우리 원칙은 "판독 원문 미저장"입니다. 저장하지 않은 데이터는 유출될 수 없다는 것이 발표에서 쓸 무기인데, DB를 붙이면 "그럼 무엇을 저장하느냐"는 질문이 새로 생깁니다.
2. **데모 3컷에 DB가 필요한 화면이 없음** — 진단 결과는 클라이언트 상태(zustand)로 충분하고, 판독은 요청마다 끝납니다.
3. **스코프** — 남은 시간에 인증·스키마·마이그레이션을 붙이면 정작 판독 화면 완성도가 희생됩니다.

나중에 Shield Score 누적이나 사용자 제보를 **실제로** 구현하게 되면 그때 붙입니다. 그 경우 **Supabase**를 권합니다(Postgres라 스키마가 명확하고 Vercel과 연동이 쉬움). 그전까지 발표에서는 "지금은 저장하지 않는다"가 오히려 정답입니다.
