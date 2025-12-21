
export interface Politician {
  id: string;
  name: string;
  party: string;
  district: string;
  image: string;
  bio: string;
  education: string[];
  career: string[];
  contact: {
    email: string;
    phone: string;
    website?: string;
    blog?: string;
  };
}

export interface Bill {
  id: string;
  politicianId: string;
  title: string;
  proposeDate: string;
  status: "계류의안" | "가결" | "부결" | "폐기";
  summary: string;
}

export interface News {
  id: string;
  politicianId: string;
  title: string;
  press: string;
  date: string;
  url: string;
  thumbnail?: string;
}

export interface CommunityPost {
  id: string;
  politicianId: string;
  author: string;
  authorBadge?: string; // e.g. "지역구민", "후원회원"
  category: "응원" | "토론" | "질문" | "제안";
  content: string;
  date: string;
  likes: number;
  comments: number;
}

export const MOCK_POLITICIANS: Politician[] = [
  {
    id: "1",
    name: "김민수",
    party: "국민의힘",
    district: "서울 강남구갑",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kim",
    bio: "대한민국의 미래를 위한 깨끗한 정치, 김민수입니다.",
    education: ["서울대학교 법학과 졸업", "서울대학교 대학원 법학 석사"],
    career: ["제21대 국회의원", "전 서울지방검찰청 검사"],
    contact: {
      email: "kim@assembly.go.kr",
      phone: "02-784-0001",
      website: "https://www.kim.com",
    },
  },
  {
    id: "2",
    name: "이영희",
    party: "더불어민주당",
    district: "경기 수원시을",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lee",
    bio: "서민의 눈물을 닦아주는 따뜻한 정치, 이영희가 함께합니다.",
    education: ["연세대학교 정치외교학과 졸업", "미국 조지타운대 공공정책학 석사"],
    career: ["제20대, 21대 국회의원", "전 환경운동연합 대표"],
    contact: {
      email: "lee@assembly.go.kr",
      phone: "02-784-0002",
      blog: "https://blog.naver.com/lee",
    },
  },
  {
    id: "3",
    name: "박준호",
    party: "정의당",
    district: "비례대표",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Park",
    bio: "노동이 당당한 나라, 박준호가 만듭니다.",
    education: ["고려대학교 경제학과 졸업"],
    career: ["제21대 국회의원", "전 전국민주노동조합총연맹 정책실장"],
    contact: {
      email: "park@assembly.go.kr",
      phone: "02-784-0003",
    },
  },
  {
    id: "4",
    name: "최수진",
    party: "국민의힘",
    district: "부산 해운대구갑",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Choi",
    bio: "경제 전문가가 만드는 부유한 대한민국.",
    education: ["이화여자대학교 경영학과 졸업", "KAIST 경영공학 박사"],
    career: ["제21대 국회의원", "전 한국경제연구원 연구위원"],
    contact: {
      email: "choi@assembly.go.kr",
      phone: "02-784-0004",
      website: "https://www.choi.com",
    },
  },
  {
    id: "5",
    name: "정민우",
    party: "더불어민주당",
    district: "서울 마포구을",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jung",
    bio: "청년의 꿈을 응원하는 젊은 리더.",
    education: ["서강대학교 신문방송학과 졸업"],
    career: ["제21대 국회의원", "전 청년벤처기업협회 회장"],
    contact: {
      email: "jung@assembly.go.kr",
      phone: "02-784-0005",
      blog: "https://blog.naver.com/jung",
    },
  },
];

export const MOCK_BILLS: Bill[] = [
  // 김민수 (ID: 1)
  {
    id: "b1",
    politicianId: "1",
    title: "AI 산업 육성 및 지원에 관한 법률안",
    proposeDate: "2024-03-15",
    status: "계류의안",
    summary: "인공지능 산업의 체계적인 육성과 지원을 위해...",
  },
  {
    id: "b2",
    politicianId: "1",
    title: "데이터 보안 강화법",
    proposeDate: "2024-02-10",
    status: "가결",
    summary: "개인정보 및 주요 데이터의 보안을 강화하는...",
  },
  // 이영희 (ID: 2)
  {
    id: "b3",
    politicianId: "2",
    title: "친환경 도시 조성 특별법",
    proposeDate: "2024-04-01",
    status: "계류의안",
    summary: "탄소 중립 달성을 위한 친환경 도시 모델...",
  },
    {
    id: "b4",
    politicianId: "2",
    title: "일회용품 사용 규제 강화법",
    proposeDate: "2024-01-20",
    status: "부결",
    summary: "카페 및 식당 내 일회용품 사용을 전면...",
  },
   // 박준호 (ID: 3)
  {
    id: "b5",
    politicianId: "3",
    title: "노동시간 단축 지원법",
    proposeDate: "2024-03-22",
    status: "계류의안",
    summary: "주 4일제 도입 시범 사업 및 지원...",
  },
    // 최수진 (ID: 4)
  {
    id: "b6",
    politicianId: "4",
    title: "스타트업 세제 지원 확대법",
    proposeDate: "2024-02-28",
    status: "가결",
    summary: "초기 창업 기업에 대한 법인세 감면...",
  },
    // 정민우 (ID: 5)
  {
    id: "b7",
    politicianId: "5",
    title: "청년 주거 안정 특별법",
    proposeDate: "2024-03-10",
    status: "계류의안",
    summary: "청년 1인 가구를 위한 공공 임대 주택...",
  },
];

export const MOCK_NEWS: News[] = [
  {
    id: "n1",
    politicianId: "1",
    title: "김민수 의원, AI 산업 육성 토론회 개최",
    press: "한국일보",
    date: "2024-04-05",
    url: "#",
  },
  {
    id: "n2",
    politicianId: "1",
    title: "[인터뷰] 김민수 '디지털 혁신이 미래다'",
    press: "매일경제",
    date: "2024-03-20",
    url: "#",
  },
  {
    id: "n3",
    politicianId: "2",
    title: "이영희 의원 '수원시 환경 개선 예산 확보'",
    press: "경인일보",
    date: "2024-04-02",
    url: "#",
  },
  {
    id: "n4",
    politicianId: "3",
    title: "박준호, 노동계와 간담회... 현안 청취",
    press: "한겨레",
    date: "2024-03-25",
    url: "#",
  },
    {
    id: "n5",
    politicianId: "4",
    title: "최수진 '부산 엑스포 유치 실패, 재도전 해야'",
    press: "부산일보",
    date: "2024-04-01",
    url: "#",
  },
    {
    id: "n6",
    politicianId: "5",
    title: "정민우, 홍대 앞 거리 인사... 청년 표심 공략",
    press: "중앙일보",
    date: "2024-03-30",
    url: "#",
  },
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "c1",
    politicianId: "1",
    author: "시민1",
    authorBadge: "지역구민",
    category: "응원",
    content: "김민수 의원님 항상 응원합니다! 파이팅!",
    date: "2024-04-10",
    likes: 120,
    comments: 15,
  },
  {
    id: "c2",
    politicianId: "1",
    author: "강남주민",
    category: "제안",
    content: "이번 법안 발의는 정말 시의적절하네요. 다만 구체적인 실행 계획이 궁금합니다.",
    date: "2024-04-09",
    likes: 85,
    comments: 8,
  },
    {
    id: "c3",
    politicianId: "2",
    author: "환경지킴이",
    authorBadge: "후원회원",
    category: "토론",
    content: "환경 문제에 더 관심 가져주세요. 특히 미세먼지 대책이 시급합니다.",
    date: "2024-04-08",
    likes: 45,
    comments: 2,
  },
    {
    id: "c4",
    politicianId: "5",
    author: "청년화이팅",
    category: "질문",
    content: "전세 사기 문제 꼭 해결해주세요ㅠㅠ 대책은 언제 나오나요?",
    date: "2024-04-07",
    likes: 230,
    comments: 42,
  },
  {
    id: "c5",
    politicianId: "1",
    author: "정치는현실",
    category: "토론",
    content: "AI 법안 좋지만 일자리 감소에 대한 대책도 필요해보입니다.",
    date: "2024-04-06",
    likes: 12,
    comments: 5,
  },
];
