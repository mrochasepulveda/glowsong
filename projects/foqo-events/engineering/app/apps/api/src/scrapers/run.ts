import { ScraperEngine } from './core/ScraperEngine.js';

async function main() {
  console.log('🚀 Starting manual run of Scraper Engine...');
  try {
    await ScraperEngine.runAll();
    console.log('✅ Finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

main();
