import { chromium, type Page } from "playwright";
import { prisma } from "@politics/database";

interface BillData {
  billNumber: string;
  billName: string;
  proposerType: string;
  proposer: string | null;
  committee: string;
  proposalReason: string;
  mainContent: string;
  noticeStart: Date;
  noticeEnd: Date;
  opinionCount: number;
  sourceUrl: string;
}

export async function crawlBills(): Promise<void> {
  console.log("Starting bills crawler...");

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 계류의안(진행중) 페이지 접근 (최근 접수 의안 포함)
    await page.goto(
      "https://likms.assembly.go.kr/bill/bi/bill/state/mooringBillPage.do",
      { waitUntil: "networkidle", timeout: 60000 }
    );

    // 검색 버튼 클릭하여 목록 로드
    const searchBtn = page.locator(".srch_btn a, a:has-text('검색')").first();
    if (await searchBtn.isVisible()) {
        await searchBtn.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000); 
    }

    // 테이블에서 법안 목록 수집
    const bills = await extractBillsFromPage(page);

    console.log(`Found ${bills.length} bills`);

    // 각 법안 DB에 저장
    for (const bill of bills) {
      await saveBill(bill);
    }

    console.log("Bills crawl completed");
  } catch (error) {
    console.error("Error in bills crawler:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function extractBillsFromPage(page: Page): Promise<BillData[]> {
  const bills: BillData[] = [];

  try {
    // 테이블 행 선택
    const rows = await page.$$("table tbody tr");

    for (const row of rows) {
      try {
        const cells = await row.$$("td");
        // 예상 구조: 번호, 의안명, 제안자, 소관위, 접수일, ...
        // 구조가 다를 수 있으므로 텍스트 확인 필요
        if (cells.length < 5) continue;

        const billNumber = await cells[0]?.textContent() || "";
        const billNameEl = await cells[1]?.$("a");
        const billName = await cells[1]?.textContent() || ""; // a 태그 없을 수 있음
        const proposer = await cells[2]?.textContent() || "";
        const committee = await cells[3]?.textContent() || "";
        const dateText = await cells[4]?.textContent() || "";

        if (!billNumber || !billName) continue;

        // 링크 추출 (상세 페이지)
        // const detailLink = await billNameEl?.getAttribute("href");

        const noticeEnd = parseDate("2099-12-31"); // 접수 단계라 종료일 없음
        const noticeStart = parseDate(dateText);

        bills.push({
          billNumber: billNumber.trim(),
          billName: billName.trim(),
          proposerType: "의원", // 기본값
          proposer: proposer.trim(),
          committee: committee.trim(),
          proposalReason: "상세 정보 확인 필요",
          mainContent: "상세 정보 확인 필요",
          noticeStart,
          noticeEnd,
          opinionCount: 0,
          sourceUrl: "https://likms.assembly.go.kr/bill/bi/bill/state/receiptBillPage.do",
        });
      } catch (error) {
        console.error("Error extracting row:", error);
      }
    }
  } catch (error) {
    console.error("Error extracting bills:", error);
  }

  return bills;
}

function parseDate(dateText: string): Date {
  // 다양한 날짜 형식 파싱
  const cleaned = dateText.trim();

  // YYYY-MM-DD 또는 YYYY.MM.DD 형식
  const match = cleaned.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    return new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3])
    );
  }

  // 기본값: 30일 후
  const future = new Date();
  future.setDate(future.getDate() + 30);
  return future;
}

async function saveBill(data: BillData): Promise<void> {
  try {
    await prisma.bill.upsert({
      where: { billNumber: data.billNumber },
      update: {
        billName: data.billName,
        proposerType: data.proposerType,
        proposer: data.proposer,
        committee: data.committee,
        proposalReason: data.proposalReason,
        mainContent: data.mainContent,
        noticeStart: data.noticeStart,
        noticeEnd: data.noticeEnd,
        opinionCount: data.opinionCount,
        sourceUrl: data.sourceUrl,
        updatedAt: new Date(),
      },
      create: {
        billNumber: data.billNumber,
        billName: data.billName,
        proposerType: data.proposerType,
        proposer: data.proposer,
        committee: data.committee,
        proposalReason: data.proposalReason,
        mainContent: data.mainContent,
        noticeStart: data.noticeStart,
        noticeEnd: data.noticeEnd,
        opinionCount: data.opinionCount,
        sourceUrl: data.sourceUrl,
      },
    });
    console.log(`Saved bill: ${data.billNumber}`);
  } catch (error) {
    console.error(`Error saving bill ${data.billNumber}:`, error);
  }
}

// 개별 실행용
if (process.argv[1]?.includes("crawl-bills")) {
  crawlBills()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
