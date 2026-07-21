// ============================================================
// 취약성 진단 4축 문항 — [담당: 지식·프롬프트]
// TODO: 축당 3~4문항으로 확장할 것 (지금은 구조 검증용 1문항씩만 있음)
// ============================================================

import type { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    axis: 'authority',
    text: '모르는 번호로 "○○은행입니다"라며 전화가 왔다. 당신은?',
    options: [
      { label: '일단 안내를 끝까지 듣는다', score: 80 },
      { label: '소속과 이름을 다시 묻고 끊은 뒤 대표번호로 확인한다', score: 20 },
    ],
  },
  {
    id: 'q2',
    axis: 'urgency',
    text: '"지금 아니면 이 조건은 끝난다"는 말을 들으면?',
    options: [
      { label: '놓칠까 봐 서둘러 결정한다', score: 80 },
      { label: '일단 하루 미루고 생각한다', score: 20 },
    ],
  },
  {
    id: 'q3',
    axis: 'greed',
    text: '"원금 보장에 월 20% 수익"이라는 제안을 받으면?',
    options: [
      { label: '솔깃해서 더 알아본다', score: 80 },
      { label: '비현실적이라 바로 거른다', score: 20 },
    ],
  },
  {
    id: 'q4',
    axis: 'verify',
    text: '계약서나 공문을 받으면?',
    options: [
      { label: '내용을 대략 훑고 서명한다', score: 20 },
      { label: '조항 하나하나를 확인하고 모르면 찾아본다', score: 80 },
    ],
  },
];
