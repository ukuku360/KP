import { crawlBills } from "./crawlers/bills.js";

crawlBills()
  .then(() => {
    console.log("Bills crawl completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Bills crawl failed:", error);
    process.exit(1);
  });
