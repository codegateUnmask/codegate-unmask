# PR 처음 해보는 사람용 가이드

git이나 PR이 처음이어도 괜찮습니다. 아래 순서대로, **AI(Claude Code 등)한테 그대로 복사해서 시키면** 됩니다.
직접 터미널 명령어를 쳐도 되고, AI한테 "이거 해줘"라고 시켜도 됩니다 — 둘 다 적어뒀습니다.

---

## 0. 준비물

- [ ] Git 설치 확인: 터미널에 `git --version` 쳐서 버전이 나오면 OK
- [ ] Node.js 설치 확인: `node --version` 쳐서 18 이상이면 OK
- [ ] GitHub에서 `codegateUnmask` 조직 초대 메일/알림 수락했는지 확인

---

## 1. 레포 받아오기 (최초 1회만)

터미널(윈도우는 PowerShell, 맥은 터미널) 열고 원하는 폴더에서:

```bash
git clone https://github.com/codegateUnmask/codegate-unmask.git
cd codegate-unmask
```

## 2. 실행 환경 세팅 (최초 1회만)

```bash
npm install
```

`.env.example`을 복사해서 `.env.local`을 만들고, 팀 채팅방에서 받은 API 키를 채워 넣으세요.

```bash
# 윈도우
copy .env.example .env.local
# 맥/리눅스
cp .env.example .env.local
```

---

## 3. 작업 시작 전 — 새 브랜치 만들기

**⚠️ main에서 바로 작업하지 마세요.** 작업을 시작할 때마다 매번:

```bash
git checkout main
git pull
git checkout -b 이니셜/기능이름
```

예시: `git checkout -b yh/diagnose-questions`

> AI한테 시키려면: **"main을 최신으로 받고, `이니셜/기능이름`이라는 새 브랜치를 만들어서 그 위에서 작업할 준비를 해줘"**

---

## 4. AI한테 작업 시키기

이 폴더에서 Claude Code(또는 쓰는 AI 코딩 툴)를 켜고, 아래처럼 시키면 됩니다:

> **"이 프로젝트의 CLAUDE.md를 먼저 읽고, [내가 맡은 부분, 예: 진단 문항(`lib/diagnosis/questions.ts`)]을 [하고 싶은 작업]해줘."**

AI가 코드를 만들거나 고치면, `npm run dev` 실행해서 브라우저(`localhost:3000`)에서 **직접 눌러서 확인**하세요. "AI가 만들어줬으니 됐겠지"는 금물 — 한 번은 실제로 클릭해서 확인합니다.

---

## 5. 변경사항 커밋 + 푸시

작업이 끝나면 AI한테 그대로 시켜도 됩니다:

> **"지금까지 바뀐 내용을 확인하고, 커밋 메시지 만들어서 커밋한 다음 이 브랜치를 push해줘"**

직접 하고 싶으면:

```bash
git add .
git status          # ⚠️ 뭐가 올라가는지 꼭 확인! .env.local 같은 게 보이면 안 됨
git commit -m "무엇을 했는지 한 줄로"
git push -u origin 브랜치이름
```

---

## 6. GitHub에서 PR(Pull Request) 열기

1. push가 끝나면 터미널에 `https://github.com/.../pull/new/...` 같은 링크가 뜹니다 — 그걸 클릭
   - (안 뜨면) 브라우저로 https://github.com/codegateUnmask/codegate-unmask 접속 → 초록색 **"Compare & pull request"** 버튼 클릭
2. 제목·설명에 뭘 했는지 한두 줄 적기
3. **"Create pull request"** 클릭
4. 팀 채팅방에 PR 링크 공유 → 팀원이 확인 후 머지

---

## 7. 머지된 후

```bash
git checkout main
git pull
```

방금 머지된 내용이 내 main에도 반영됩니다. 다음 작업은 다시 **3번**부터 반복.

---

## 주의사항

- API 키는 절대 코드에 직접 쓰지 말고 `.env.local`에만 (이 파일은 커밋이 안 되는 게 정상입니다)
- `lib/types.ts`, `lib/engine/` 은 코어 오너 담당 — 다른 사람이 고쳐야 하면 먼저 말하고 고치기
- 5분 넘게 막히면 혼자 붙잡지 말고 바로 팀 채팅방에 물어보기
