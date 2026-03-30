import { ScraperEngine } from '../scrapers/core/ScraperEngine.js';

export function startCronJobs() {
  console.log('⏱️ Starting Scraper Cronjob Planner...');

  // Simple setInterval to run the Scraper Engine every 12 hours
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      console.log('⏰ Executing Scheduled Scraper Engine Task...');
      await ScraperEngine.runAll();
    } catch (e) {
      console.error('❌ Scheduled Scraper task failed', e);
    }
  }, TWELVE_HOURS);
}
