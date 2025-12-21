import { crawlPetitions } from "./crawlers/petitions.js";

crawlPetitions()
  .then(() => {
    console.log("Petitions crawl completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Petitions crawl failed:", error);
    process.exit(1);
  });
