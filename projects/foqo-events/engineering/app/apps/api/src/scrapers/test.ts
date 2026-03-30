import { PuntoTicketScraper } from './sources/PuntoTicketScraper.js';

async function main() {
  console.log('🧪 Testing PuntoTicket Scraper...');
  const scraper = new PuntoTicketScraper('https://www.puntoticket.com');
  
  try {
    const events = await scraper.scrape();
    console.log(`\n✅ Scraped ${events.length} events:\n`);
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
