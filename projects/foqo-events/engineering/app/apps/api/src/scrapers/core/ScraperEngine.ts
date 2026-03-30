import { db } from '../../db/index.js';
import { scrapingSources, scrapingLogs, events, artists, venues } from '../../db/schema.js';
import { eq, ilike } from 'drizzle-orm';
import { PuntoTicketScraper } from '../sources/PuntoTicketScraper.js';
import { InstagramScraper } from '../sources/InstagramScraper.js';
import { PasslineScraper } from '../sources/PasslineScraper.js';
import { TicketmasterScraper } from '../sources/TicketmasterScraper.js';
import { TicketplusScraper } from '../sources/TicketplusScraper.js';
export interface ScrapedEvent {
  title: string;
  artistName: string;
  venueName: string;
  date: Date;
  priceMin?: number;
  imageUrl?: string;
  ticketUrl: string;
}

export interface IScraperSource {
  scrape(): Promise<ScrapedEvent[]>;
}

export class ScraperEngine {
  
  /**
   * Main entry point to run all active scrapers
   */
  static async runAll() {
    console.log('🤖 Starting Scraper Engine...');
    
    // 1. Fetch active sources from DB
    const sources = await db.select().from(scrapingSources).where(eq(scrapingSources.isActive, true));
    
    console.log(`📡 Found ${sources.length} active sources`);

    for (const source of sources) {
      console.log(`\n⏳ Running scraper for: ${source.name} (${source.type})`);
      const startTime = Date.now();
      
      let scraper: IScraperSource | null = null;
      let status: 'success' | 'error' | 'partial' = 'success';
      let eventsFound = 0;
      let eventsNew = 0;
      let errorMessage: string | null = null;

      try {
        // Instantiate the correct scraper
        switch (source.type) {
          case 'puntoticket':
            scraper = new PuntoTicketScraper(source.url);
            break;
          case 'instagram':
            scraper = new InstagramScraper(source.url);
            break;
          case 'passline':
            scraper = new PasslineScraper(source.url);
            break;
          case 'ticketmaster':
            scraper = new TicketmasterScraper(source.url);
            break;
          case 'ticketplus':
            scraper = new TicketplusScraper(source.url);
            break;
          default:
            console.log(`⚠️ No scraper implemented yet for type: ${source.type}`);
            continue;
        }

        // Run the scraper
        const scrapedEvents = await scraper.scrape();
        eventsFound = scrapedEvents.length;
        
        console.log(`✅ Extracted ${eventsFound} events from ${source.name}`);
        
        // Process and save events
        eventsNew = await this.saveEvents(scrapedEvents, source.id, source.name);
        
      } catch (error: any) {
        console.error(`❌ Error scraping ${source.name}:`, error.message);
        status = 'error';
        errorMessage = error.message;
      } finally {
        const durationMs = Date.now() - startTime;
        
        // Log the run to the database
        await db.insert(scrapingLogs).values({
          sourceId: source.id,
          status,
          eventsFound,
          eventsNew,
          errorMessage,
          durationMs,
        });
        
        // Update lastScrapedAt on the source
        await db.update(scrapingSources)
          .set({ lastScrapedAt: new Date() })
          .where(eq(scrapingSources.id, source.id));
      }
    }
    
    console.log('\n🏁 Scraper Engine finished all tasks.');
  }

  /**
   * Saves scraped events to the database, ensuring no duplicates.
   * Creates Artists and Venues if they don't exist.
   */
  private static async saveEvents(scrapedEvents: ScrapedEvent[], sourceId: string, sourceName: string): Promise<number> {
    console.log(`\n💾 saveEvents starting for ${scrapedEvents.length} events...`);
    let newEventsCount = 0;

    for (const scraped of scrapedEvents) {
      console.log(`Processing artist: ${scraped.artistName}`);
      // 1. Find or create Artist
      let [artist] = await db.select().from(artists).where(ilike(artists.name, scraped.artistName)).limit(1);

      if (!artist) {
        console.log(`Inserting artist: ${scraped.artistName}`);
        const [newArtist] = await db.insert(artists).values({
          name: scraped.artistName,
          popularity: 50
        }).returning();
        artist = newArtist;
      }

      // 2. Find or create Venue
      let [venue] = await db.select().from(venues).where(ilike(venues.name, scraped.venueName)).limit(1);

      if (!venue) {
        let city = 'Santiago';
        if (scraped.venueName.includes('-')) {
          const parts = scraped.venueName.split('-');
          city = parts[parts.length - 1].trim();
        }
        
        console.log(`Inserting venue: ${scraped.venueName}`);
        const [newVenue] = await db.insert(venues).values({
          name: scraped.venueName,
          city: city
        }).returning();
        venue = newVenue;
      }

      // 3. Find if Event already exists
      const [existingEvent] = await db.select().from(events).where(eq(events.ticketUrl, scraped.ticketUrl)).limit(1);

      if (!existingEvent) {
        console.log(`Inserting event: ${scraped.title}`);
        await db.insert(events).values({
          title: scraped.title,
          artistId: artist.id,
          venueId: venue.id,
          date: scraped.date,
          ticketUrl: scraped.ticketUrl,
          imageUrl: scraped.imageUrl,
          source: sourceName,
        });
        newEventsCount++;
      }
    }

    return newEventsCount;
  }
}
