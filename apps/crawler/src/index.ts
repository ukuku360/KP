import express from "express";
import cron from "node-cron";
import { crawlBills } from "./crawlers/bills.js";
import { crawlBillsViaApi, updateEndedBillsStatus } from "./crawlers/bills-api.js";
import { crawlPetitions } from "./crawlers/petitions.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

console.log("Starting Politics Crawler Service...");

// API Endpoints
app.post("/crawl/bills", async (req, res) => {
  console.log("Received manual trigger for bills crawler");
  res.status(202).json({ message: "Bill crawling started" }); // Respond immediately
  
  try {
    await crawlBills();
    console.log("Manual bills crawl completed successfully");
  } catch (error) {
    console.error("Manual bills crawl failed:", error);
  }
});

app.post("/crawl/petitions", async (req, res) => {
  console.log("Received manual trigger for petitions crawler");
  res.status(202).json({ message: "Petition crawling started" });
  
  try {
    await crawlPetitions();
    console.log("Manual petitions crawl completed successfully");
  } catch (error) {
    console.error("Manual petitions crawl failed:", error);
  }
});

// API 기반 입법예고 크롤러 (권장)
app.post("/crawl/bills-api", async (req, res) => {
  console.log("Received manual trigger for bills-api crawler");
  res.status(202).json({ message: "Bill API crawling started" });
  
  try {
    const stats = await crawlBillsViaApi({
      includeEnded: false,
      fetchDetails: false,
      concurrency: 3,
    });
    console.log("Manual bills-api crawl completed:", stats);
  } catch (error) {
    console.error("Manual bills-api crawl failed:", error);
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Scheduled Tasks
// 입법예고: 매일 06:00, 18:00 (웹 크롤러 사용)
cron.schedule("0 6,18 * * *", async () => {
  console.log("Running scheduled bills crawler...");
  try {
    await crawlBills();
    await updateEndedBillsStatus(); // 종료된 법안 상태 업데이트
    console.log("Scheduled bills crawl completed successfully");
  } catch (error) {
    console.error("Scheduled bills crawl failed:", error instanceof Error ? error.message : error);
  }
}, { timezone: "Asia/Seoul" });

// 청원: 매 1시간마다
cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled petitions crawler...");
  try {
    await crawlPetitions();
    console.log("Scheduled petitions crawl completed successfully");
  } catch (error) {
    console.error("Scheduled petitions crawl failed:", error);
  }
}, { timezone: "Asia/Seoul" });

// Start Server
app.listen(port, () => {
  console.log(`Crawler API listening at http://localhost:${port}`);
  console.log("Scheduled tasks:");
  console.log("- Bills: Every day at 06:00 and 18:00 KST (웹 크롤러)");
  console.log("- Petitions: Every hour at :00 KST");
  console.log("");
  console.log("API endpoints:");
  console.log("- POST /crawl/bills       (웹 크롤링)");
  console.log("- POST /crawl/bills-api   (API 기반 - 개발 중)");
  console.log("- POST /crawl/petitions");
  console.log("- GET  /health");
});
