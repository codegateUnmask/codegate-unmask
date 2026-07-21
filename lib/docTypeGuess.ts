// ============================================================
// [B 담당] 문서 유형 추정 — 탭과 다른 문서가 들어오면 안내하기 위한 UX 가드.
//
// ⚠️ 역할 구분: 정식 분류기는 D의 lib/knowledge/router.ts(서버 전용).
//    이 파일은 화면에서 "탭 잘못 고른 것 같아요"를 알려주는 가벼운 힌트로,
//    지식 팩을 브라우저로 가져오지 않기 위해 독립 키워드만 사용한다.
// 판단이 애매하면 절대 막지 않는다(확신 높을 때만 안내) — 오분류로
//    정상 문서를 막는 것이 최악이므로 보수적으로 동작.
// ============================================================

import type { DocType } from './types';

const KEYWORDS: Record<DocType, { word: string; w: number }[]> = {
  lease: [
    { word: '임대차', w: 3 }, { word: '임대인', w: 3 }, { word: '임차인', w: 3 },
    { word: '전세', w: 2 }, { word: '월세', w: 2 }, { word: '보증금', w: 2 },
    { word: '전입신고', w: 3 }, { word: '확정일자', w: 3 }, { word: '등기부', w: 3 },
    { word: '원상복구', w: 1 }, { word: '중개', w: 1 },
  ],
  labor: [
    { word: '근로', w: 3 }, { word: '근무', w: 2 }, { word: '임금', w: 2 },
    { word: '시급', w: 3 }, { word: '급여', w: 2 }, { word: '주휴', w: 3 },
    { word: '수습', w: 2 }, { word: '해고', w: 2 }, { word: '4대보험', w: 3 },
    { word: '연장근로', w: 3 }, { word: '갑', w: 1 }, { word: '을', w: 1 },
  ],
  service: [
    { word: '회원권', w: 3 }, { word: '이용권', w: 3 }, { word: '회차', w: 3 },
    { word: '정기권', w: 3 }, { word: '가입비', w: 2 }, { word: '피트니스', w: 3 },
    { word: '헬스', w: 3 }, { word: '시술', w: 3 }, { word: '패키지', w: 2 },
    { word: '노쇼', w: 2 }, { word: 'PT', w: 2 },
  ],
  terms: [
    { word: '약관', w: 3 }, { word: '구독', w: 2 }, { word: '멤버십', w: 2 },
    { word: '청약철회', w: 2 }, { word: '개인정보', w: 1 }, { word: '서비스', w: 1 },
    { word: '이용자', w: 1 }, { word: '관할', w: 1 },
  ],
  message: [
    { word: '[Web발신]', w: 4 }, { word: '국제발신', w: 4 }, { word: 'http://', w: 3 },
    { word: 'https://', w: 3 }, { word: '인증', w: 1 }, { word: '클릭', w: 2 },
    { word: '승인', w: 1 }, { word: '발신', w: 2 },
  ],
};

const LABEL: Record<DocType, string> = {
  lease: '전월세', labor: '근로계약', service: '선불서비스', terms: '약관', message: '문자',
};

export interface DocGuess {
  /** 추정 유형 (확신 없으면 null) */
  type: DocType | null;
  label: string | null;
  scores: Record<DocType, number>;
}

export function guessDocType(text: string): DocGuess {
  const scores = { lease: 0, labor: 0, service: 0, terms: 0, message: 0 } as Record<DocType, number>;
  for (const t of Object.keys(KEYWORDS) as DocType[]) {
    for (const { word, w } of KEYWORDS[t]) {
      // 등장 횟수 × 가중치 (최대 3회까지만 카운트 — 반복 남용 방지)
      const count = Math.min(3, text.split(word).length - 1);
      scores[t] += count * w;
    }
  }
  // 문자 특성 보정: 짧고 링크가 있으면 message 가산
  if (text.length < 400 && /https?:\/\//.test(text)) scores.message += 4;

  const ranked = (Object.entries(scores) as [DocType, number][]).sort((a, b) => b[1] - a[1]);
  const [bestType, bestScore] = ranked[0];
  const second = ranked[1][1];
  // 확신 조건: 점수가 충분히 높고(6+), 2위와 격차가 뚜렷할 때만
  const confident = bestScore >= 6 && bestScore >= second * 1.6;
  return {
    type: confident ? bestType : null,
    label: confident ? LABEL[bestType] : null,
    scores,
  };
}

/** 탭과 문서가 어긋났을 때만 true (추정 확신이 있을 때만) */
export function isMismatch(text: string, current: DocType): { mismatch: boolean; suggest: DocType | null; suggestLabel: string | null } {
  const g = guessDocType(text);
  if (g.type && g.type !== current) return { mismatch: true, suggest: g.type, suggestLabel: g.label };
  return { mismatch: false, suggest: null, suggestLabel: null };
}
