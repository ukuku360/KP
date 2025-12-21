import cron from "node-cron";
import { crawlBills } from "./crawlers/bills.js";
import { crawlPetitions } from "./crawlers/petitions.js";

console.log("Starting Politics Crawler Service...");

// 입법예고: 매일 06:00, 18:00
cron.schedule("0 6,18 * * *", async () => {
  console.log("Running bills crawler...");
  try {
    await crawlBills();
    console.log("Bills crawl completed successfully");
  } catch (error) {
    console.error("Bills crawl failed:", error);
  }
}, { timezone: "Asia/Seoul" });

// 청원: 매 1시간마다
cron.schedule("0 * * * *", async () => {
  console.log("Running petitions crawler...");
  try {
    await crawlPetitions();
    console.log("Petitions crawl completed successfully");
  } catch (error) {
    console.error("Petitions crawl failed:", error);
  }
}, { timezone: "Asia/Seoul" });

// 시작시 한번 실행
async function runInitialCrawl() {
  console.log("Running initial crawl...");

  try {
    console.log("Crawling bills...");
    await crawlBills();
  } catch (error) {
    console.error("Initial bills crawl failed:", error);
  }

  try {
    console.log("Crawling petitions...");
    await crawlPetitions();
  } catch (error) {
    console.error("Initial petitions crawl failed:", error);
  }

  console.log("Initial crawl completed");
}

// 초기 실행 (5초 후)
setTimeout(runInitialCrawl, 5000);

console.log("Crawler service started. Scheduled tasks:");
console.log("- Bills: Every day at 06:00 and 18:00");
console.log("- Petitions: Every hour at :00");
