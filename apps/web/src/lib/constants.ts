import { BillStatus, PetitionStatus } from "@politics/database";

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  POSTS_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const DEFAULT_BILL_STATUS = BillStatus.IN_PROGRESS;
export const DEFAULT_PETITION_STATUS = PetitionStatus.IN_PROGRESS;

export const TOTAL_SEATS = 300;

export const COMMITTEES = [
  "전체",
  "법제사법위원회",
  "정무위원회",
  "기획재정위원회",
  "교육위원회",
  "과학기술정보방송통신위원회",
  "외교통일위원회",
  "국방위원회",
  "행정안전위원회",
  "문화체육관광위원회",
  "농림축산식품해양수산위원회",
  "산업통상자원중소벤처기업위원회",
  "보건복지위원회",
  "환경노동위원회",
  "국토교통위원회",
] as const;

export const PETITION_CATEGORIES = [
  "전체",
  "정치/선거",
  "수사/법무",
  "재정/세제",
  "외교/통일",
  "국방",
  "경제/산업",
  "교육",
  "환경/기후",
  "노동",
  "교통/통신",
  "복지/보건",
  "문화/체육",
  "안전/재해",
  "농어업",
  "국토/해양",
  "인권/여성",
  "행정",
  "기타",
] as const;

export const POST_CATEGORIES = [
  { id: "free", name: "자유게시판", description: "자유롭게 의견을 나눠보세요" },
  { id: "policy", name: "정책제안", description: "정책에 대한 제안을 작성하세요" },
  { id: "factcheck", name: "팩트체크", description: "사실관계를 검증해보세요" },
  { id: "discussion", name: "토론", description: "열린 토론에 참여하세요" },
  { id: "qna", name: "질문답변", description: "정치 관련 궁금한 점을 물어보세요" },
] as const;

// 뱃지 상품 가격 (원)
export const BADGE_PRICES = {
  SUPPORTER: 3900,      // 일반 서포터 뱃지
  POLITICIAN_FAN: 5900, // 정치인 팬 뱃지
} as const;

// 뱃지 유효 기간 (일)
export const BADGE_DURATION_DAYS = 30;
