import { InstagramScraper } from './sources/InstagramScraper.js';

async function main() {
  console.log('🧪 Testing Instagram Scraper (with Playwright Stealth + Claude AI)...');
  // dgmedios is a popular event producer in Chile
  const scraper = new InstagramScraper('https://www.instagram.com/dgmedios/');
  
  try {
    const events = await scraper.scrape();
    console.log(`\n✅ Claude found ${events.length} events:\n`);
    events.forEach((e, i) => {
      console.log(`[${i + 1}] ${e.title}`);
      console.log(`    Artist: ${e.artistName}`);
      console.log(`    Date:   ${e.date}`);
      console.log(`    Venue:  ${e.venueName}`);
      console.log(`    URL:    ${e.ticketUrl}`);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main();
