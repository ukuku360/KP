import { chromium, type Page } from "playwright";
import { prisma } from "@politics/database";

interface PetitionData {
  petitionId: string;
  category: string;
  title: string;
  content: string;
  hashtags: string[];
  agreeCount: number;
  agreeGoal: number;
  startDate: Date;
  endDate: Date;
  sourceUrl: string;
}

export async function crawlPetitions(): Promise<void> {
  console.log("Starting petitions crawler...");

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 국민동의청원 목록 페이지 접근 (최다 동의 순 등)
    await page.goto("https://petitions.assembly.go.kr/api/v1/petitions?pageIndex=1&recordCountPerPage=10&sort=AGRE_CO-D", {
        // API 직접 호출은 어려우니 웹페이지 방문
        // 실제로는 https://petitions.assembly.go.kr/ -> 청원 목록 클릭
    });
    // 그냥 페이지로 가서 돔 스크래핑
    await page.goto("https://petitions.assembly.go.kr/refer/processed/agree", { // 성립된 청원 or 진행중(ongoing)
      waitUntil: "networkidle",
      timeout: 60000,
    });
    // 진행중인 청원 (ongoing)
    await page.goto("https://petitions.assembly.go.kr/proceed/onGoingAll", {
        waitUntil: "networkidle",
        timeout: 60000
    });

    await page.waitForTimeout(3000);

    // 청원 목록 수집
    const petitions = await extractPetitionsFromPage(page);

    console.log(`Found ${petitions.length} petitions`);

    // 각 청원 DB에 저장
    for (const petition of petitions) {
      await savePetition(petition);
    }

    console.log("Petitions crawl completed");
  } catch (error) {
    console.error("Error in petitions crawler:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function extractPetitionsFromPage(page: Page): Promise<PetitionData[]> {
  const petitions: PetitionData[] = [];

  try {
    // 청원 목록 아이템 선택
    // ul.board_list_type li
    const items = await page.$$("ul.board_list_type li");

    for (const item of items) {
      try {
        // 제목
        const titleEl = await item.$(".subject");
        const title = await titleEl?.textContent() || "";
        
        // 카테고리
        const categoryEl = await item.$(".type");
        const categoryText = await categoryEl?.textContent() || "";
        const category = categoryText.replace(/[\[\]]/g, "").trim(); // [분야] -> 분야

        // 동의 수
        const countEl = await item.$(".blued");
        const countText = await countEl?.textContent() || "0";
        const agreeCount = parseInt(countText.replace(/[^0-9]/g, "")) || 0;

        // 링크
        const linkEl = await item.$("a");
        const href = await linkEl?.getAttribute("href") || "";
        
        // href format: /proceed/onGoingAll/12345...
        const petitionId = href.split("/").pop() || `${Date.now()}`;

        if (!title) continue;


        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        petitions.push({
          petitionId,
          category: category.trim(),
          title: title.trim(),
          content: "상세 내용 확인 필요",
          hashtags: [],
          agreeCount,
          agreeGoal: 50000,
          startDate: today,
          endDate,
          sourceUrl: `https://petitions.assembly.go.kr${href}`,
        });
      } catch (error) {
        console.error("Error extracting card:", error);
      }
    }
  } catch (error) {
    console.error("Error extracting petitions:", error);
  }

  return petitions;
}

async function savePetition(data: PetitionData): Promise<void> {
  try {
    const existing = await prisma.petition.findUnique({
      where: { petitionId: data.petitionId },
    });

    const progressRate = (data.agreeCount / data.agreeGoal) * 100;

    if (existing) {
      // 업데이트 및 히스토리 기록
      await prisma.petition.update({
        where: { petitionId: data.petitionId },
        data: {
          title: data.title,
          category: data.category,
          agreeCount: data.agreeCount,
          progressRate,
          updatedAt: new Date(),
        },
      });

      // 히스토리 기록 (이전 값과 다를 경우에만)
      if (existing.agreeCount !== data.agreeCount) {
        await prisma.petitionHistory.create({
          data: {
            petitionId: existing.id,
            agreeCount: data.agreeCount,
          },
        });
      }
    } else {
      // 새 청원 생성
      await prisma.petition.create({
        data: {
          petitionId: data.petitionId,
          category: data.category,
          title: data.title,
          content: data.content,
          hashtags: data.hashtags,
          agreeCount: data.agreeCount,
          agreeGoal: data.agreeGoal,
          progressRate,
          startDate: data.startDate,
          endDate: data.endDate,
          sourceUrl: data.sourceUrl,
        },
      });
    }

    console.log(`Saved petition: ${data.petitionId}`);
  } catch (error) {
    console.error(`Error saving petition ${data.petitionId}:`, error);
  }
}

// 개별 실행용
if (process.argv[1]?.includes("crawl-petitions")) {
  crawlPetitions()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
