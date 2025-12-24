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

// 크롤링 설정
const MAX_PAGES = 10;
const PAGE_DELAY_MS = 1000;

/**
 * 날짜 문자열을 안전하게 파싱
 * 지원 형식: YYYY-MM-DD, YYYY.MM.DD, YYYYMMDD
 */
function parseDateSafe(dateStr: string | null | undefined, defaultDays: number = 0): Date {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + defaultDays);
    return d;
  }

  // 다양한 형식을 YYYY-MM-DD로 정규화
  const cleaned = dateStr.trim().replace(/[.\/]/g, "-");
  const parsed = new Date(cleaned);

  if (isNaN(parsed.getTime())) {
    console.warn(`날짜 파싱 실패: "${dateStr}", 기본값 사용 (현재 + ${defaultDays}일)`);
    const d = new Date();
    d.setDate(d.getDate() + defaultDays);
    return d;
  }

  return parsed;
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

    // Legislative Notice System - Ongoing Notices
    const baseUrl =
      "https://pal.assembly.go.kr/napal/lgsltpa/lgsltpaOngoing/list.do?menuNo=1100026";

    // 여러 페이지에서 법안 링크 수집
    const allBillLinks: string[] = [];

    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      const pageUrl = `${baseUrl}&pageIndex=${pageNum}`;
      console.log(`페이지 ${pageNum} 크롤링 중...`);

      await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 60000 });

      const pageLinks = await getBillLinks(page);

      if (pageLinks.length === 0) {
        console.log(`페이지 ${pageNum}에서 더 이상 법안을 찾을 수 없습니다.`);
        break;
      }

      allBillLinks.push(...pageLinks);
      console.log(`페이지 ${pageNum}: ${pageLinks.length}개 법안 발견 (총: ${allBillLinks.length}개)`);

      // 서버 부담 줄이기
      if (pageNum < MAX_PAGES) {
        await page.waitForTimeout(PAGE_DELAY_MS);
      }
    }

    console.log(`총 ${allBillLinks.length}개 법안 링크 수집 완료`);

    let validBills = 0;

    // Visit each bill page to get details
    for (const link of allBillLinks) {
      try {
        const detailPage = await context.newPage();
        await detailPage.goto(link, { waitUntil: "domcontentloaded" });
        
        const billData = await extractBillDetails(detailPage, link);
        if (billData) {
            await saveBill(billData);
            validBills++;
        }
        
        await detailPage.close();
        // Be polite to the server
        await page.waitForTimeout(500); 
      } catch (err) {
        console.error(`Failed to process bill at ${link}:`, err);
      }
    }

    console.log(`Bills crawl completed. Processed ${validBills} bills.`);
  } catch (error) {
    console.error("Error in bills crawler:", error);
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

async function getBillLinks(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
        const rows = document.querySelectorAll('tbody tr');
        const urls: string[] = [];
        rows.forEach(row => {
            const link = row.querySelector('a');
            if (link && link.href && link.href.includes('view.do')) {
                urls.push(link.href);
            }
        });
        return urls;
    });
}

async function extractBillDetails(page: Page, url: string): Promise<BillData | null> {
    try {
        await page.waitForSelector('.view_cont', { timeout: 5000 }).catch(() => null);

        const data = await page.evaluate(() => {
            const viewCont = document.querySelector('.view_cont');

            // Title Extraction
            const h3s = Array.from(document.querySelectorAll('h3'));
            let titleElement = h3s.find(h => {
                const t = h.textContent?.trim() || "";
                return t.includes("법률안") || (t.length > 10 && !t.includes("진행 중 입법예고"));
            });
            
            // Fallback: the h3 immediately preceding .view_cont
            if (!titleElement && viewCont) {
                let prev = viewCont.previousElementSibling;
                while(prev) {
                    if (prev.tagName === 'H3') {
                        titleElement = prev as HTMLHeadingElement;
                        break;
                    }
                    prev = prev.previousElementSibling;
                }
            }

            const titleText = titleElement?.textContent?.trim() || "";
            
            let billName = titleText;
            let proposerText = "미정"; // Default
            
            if (titleText.includes('(') && titleText.includes(')')) {
                const match = titleText.match(/\((.*?)\)$/);
                if (match) {
                    proposerText = match[1];
                }
                billName = titleText.replace(/\s*\(.*?\)$/, "").trim(); 
            }

            // Metadata from .view_cont
            let committee = "미정";
            let startStr = "";
            let endStr = "";
            
            if (viewCont) {
                const textContent = (viewCont as HTMLElement).innerText || ""; 
                const lines = textContent.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
                
                // Find "입법예고기간" line
                const periodLine = lines.find((l: string) => l.includes("입법예고기간"));
                if (periodLine) {
                    const dates = periodLine.replace("입법예고기간", "").replace(":", "").trim();
                     const parts = dates.split('~');
                     if (parts.length >= 2) {
                        startStr = parts[0].trim();
                        endStr = parts[1].trim();
                     }
                }

                // Committee heuristic
                if (lines[0] === "입법예고 법률안" && lines[1]) {
                    committee = lines[1];
                }
                
                // Update proposer if still default
                if (proposerText === "미정" && lines[2]) {
                    proposerText = lines[2].replace("제안자목록", "").trim();
                }
            }

            // Content
            let contentText = "";
            const h4s = Array.from(document.querySelectorAll('h4'));
            let contentHeader = null;
            
            for (const h of h4s) {
                if (h.textContent?.includes('제안이유') || h.textContent?.includes('주요내용')) {
                    contentHeader = h;
                    break;
                }
            }

            if (contentHeader) {
                let sibling = contentHeader.nextElementSibling;
                while(sibling) {
                    if (sibling.tagName === 'DIV') {
                        contentText = sibling.textContent?.trim() || "";
                        break;
                    }
                    sibling = sibling.nextElementSibling;
                }
            } else {
                 const contentDiv = document.querySelector('.txt_content');
                 if (contentDiv) contentText = contentDiv.textContent?.trim() || "";
            }

            return {
                billName: billName || "제목 없음",
                proposer: proposerText,
                committee,
                noticeStartStr: startStr,
                noticeEndStr: endStr,
                content: contentText
            };
        });

        const urlObj = new URL(url);
        const billId = urlObj.searchParams.get('lgsltPaId') || `UNKNOWN-${Date.now()}`;

        // 안전한 날짜 파싱 (실패 시 기본값 사용)
        const noticeStart = parseDateSafe(data.noticeStartStr, 0);
        const noticeEnd = parseDateSafe(data.noticeEndStr, 14);

        return {
            billNumber: billId,
            billName: data.billName,
            proposerType: data.proposer.includes("정부") ? "정부" : "의원",
            proposer: data.proposer,
            committee: data.committee,
            proposalReason: data.content.substring(0, 500),
            mainContent: data.content,
            noticeStart,
            noticeEnd,
            opinionCount: 0,
            sourceUrl: url,
        };

    } catch (e) {
        console.error(`Error details on page ${url}`, e);
        return null;
    }
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
        status: "IN_PROGRESS"
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
        status: "IN_PROGRESS"
      },
    });
    console.log(`Saved/Updated bill: ${data.billName}`);
  } catch (error) {
    console.error(`Error saving bill ${data.billNumber}:`, error);
  }
}

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
