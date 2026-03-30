import { chromium, Browser } from 'playwright';
import * as cheerio from 'cheerio';
import { IScraperSource, ScrapedEvent } from '../core/ScraperEngine.js';

export class PasslineScraper implements IScraperSource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async scrape(): Promise<ScrapedEvent[]> {
    let browser: Browser | null = null;
    const events: ScrapedEvent[] = [];

    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      console.log(`PasslineScraper: Navigating to ${this.url}`);
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000); // Give it time to load events

      const html = await page.content();
      const $ = cheerio.load(html);

      // Generic approach for passline event cards
      $('.event-card, .tarjeta-evento, a[href*="/evento/"]').each((_, el) => {
        const title = $(el).find('h3, .title, .nombre-evento').text().trim() || $(el).attr('title') || 'Evento Passline';
        let href = $(el).attr('href') || $(el).find('a').attr('href');
        if (!href) return;
        
        const fullUrl = href.startsWith('http') ? href : `https://www.passline.com${href}`;
        let image = $(el).find('img').attr('src') || '';
        
        if (title && href) {
          events.push({
            title: title.substring(0, 500),
            artistName: title.split(/ en | at | - /)[0].trim(),
            venueName: 'Por definir',
            date: new Date(), // Requires better parsing
            imageUrl: image,
            ticketUrl: fullUrl
          });
        }
      });

      return events;
    } catch (error) {
      console.error('PasslineScraper Error:', error);
      return []; // Return empty on error to avoid crashing the engine
    } finally {
      if (browser) await browser.close();
    }
  }
}
