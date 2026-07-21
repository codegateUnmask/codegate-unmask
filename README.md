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
