import { chromium, Browser } from 'playwright';
import * as cheerio from 'cheerio';
import { IScraperSource, ScrapedEvent } from '../core/ScraperEngine.js';

export class TicketplusScraper implements IScraperSource {
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
      
      console.log(`TicketplusScraper: Navigating to ${this.url}`);
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('a[href*="/eventos/"], .event-card').each((_, el) => {
        const title = $(el).find('.title, h4').text().trim() || $(el).attr('title') || 'Evento Ticketplus';
        let href = $(el).attr('href') || $(el).find('a').attr('href');
        if (!href) return;
        
        const fullUrl = href.startsWith('http') ? href : `https://ticketplus.cl${href}`;
        let image = $(el).find('img').attr('src') || '';
        
        if (title && href) {
          events.push({
            title: title.substring(0, 500),
            artistName: title.split(/ en | at | - /)[0].trim(),
            venueName: 'Por definir',
            date: new Date(),
            imageUrl: image,
            ticketUrl: fullUrl
          });
        }
      });

      return events;
    } catch (error) {
      console.error('TicketplusScraper Error:', error);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}
