/**
 * 입법예고 API 기반 크롤러 (스켈레톤)
 *
 * 데이터 출처: 국회 입법예고 정보공개 서비스
 * - 목록 API: https://www.lawmaking.go.kr/rest/ogLmPp.xml
 * - 상세 API: https://www.lawmaking.go.kr/rest/lmPln/{seq}.xml
 *
 * 환경변수:
 * - LAWMAKING_API_KEY: 정보공개 서비스 신청 ID (@ 앞부분)
 *
 * NOTE: 현재 웹 크롤러(bills.ts) 사용 권장
 * API 크롤러는 LAWMAKING_API_KEY 발급 후 활성화 예정
 */

import { prisma } from "@politics/database";

// ========== 타입 정의 ==========

interface CrawlStats {
  totalFetched: number;
  newBills: number;
  updatedBills: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
}

interface CrawlOptions {
  includeEnded?: boolean;
  fetchDetails?: boolean;
  concurrency?: number;
  delayMs?: number;
}

// ========== 스텁 함수 ==========

/**
 * API 기반 입법예고 크롤러 (미구현)
 *
 * @throws API 크롤러가 비활성화되어 있음
 */
export async function crawlBillsViaApi(_options: CrawlOptions = {}): Promise<CrawlStats> {
  console.warn("========================================");
  console.warn("[경고] bills-api 크롤러는 현재 스켈레톤 상태입니다.");
  console.warn("       웹 크롤러(bills.ts)를 사용해주세요.");
  console.warn("========================================");

  throw new Error("API 크롤러가 비활성화되어 있습니다. 웹 크롤러를 사용하세요.");
}

/**
 * 종료된 법안 상태 업데이트
 * 입법예고 기간이 지난 법안을 자동으로 ENDED 상태로 변경
 */
export async function updateEndedBillsStatus(): Promise<number> {
  const now = new Date();

  try {
    const result = await prisma.bill.updateMany({
      where: {
        status: "IN_PROGRESS",
        noticeEnd: { lt: now },
      },
      data: {
        status: "ENDED",
      },
    });

    console.log(`[상태 업데이트] ${result.count}개 법안을 종료 처리함`);
    return result.count;
  } finally {
    await prisma.$disconnect();
  }
}

