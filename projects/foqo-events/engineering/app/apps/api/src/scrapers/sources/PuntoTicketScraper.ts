import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import { IScraperSource, ScrapedEvent } from '../core/ScraperEngine.js';

function parseSpanishDate(dateStr: string): Date {
  const months: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
  };
  const match = dateStr.toLowerCase().match(/(\d{1,2})\s+de\s+([a-z]+)\s*(?:de\s*)?(\d{4})?/);
  if (match) {
    const day = parseInt(match[1]);
    const month = months[match[2]];
    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
    if (month !== undefined) return new Date(year, month, day);
  }
  return new Date(); // Fallback
}

export class PuntoTicketScraper implements IScraperSource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async scrape(): Promise<ScrapedEvent[]> {
    let browser: Browser | null = null;
    const events: ScrapedEvent[] = [];

    try {
      // Launch playwright browser (headless)
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      console.log(`PuntoTicketScraper: Navigating to ${this.url}`);
      // Go to PuntoTicket home or billboard
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait a bit for dynamic content to load
      await page.waitForTimeout(2000);

      // Extract the full HTML to parse with Cheerio (faster for node searching than Playwright's locator for many items)
      const html = await page.content();
      const $ = cheerio.load(html);

      // Analyze the DOM
      // For PuntoTicket, events are usually inside elements with classes like 'showgroup-item', 'card_evento', etc.
      // We will look for <a> tags wrapping event images/titles, common in ticket sites.
      
      // Typical PuntoTicket structure (approximate, might need adjustment):
      // <div class="event-item"> ... <span class="title">Artist</span> ... <span class="date">Date</span>
      
      // Let's grab all links inside event cards
      const eventLinks = $('article.event-item a');
      
      const processedHrefs = new Set<string>();

      eventLinks.each((_, el) => {
        const href = $(el).attr('href');
        if (!href || processedHrefs.has(href)) return;
        processedHrefs.add(href);

        const card = $(el); // We search inside the <a> tag
        
        let title = card.find('h3').text().trim() || $(el).attr('title') || '';
        
        // Fallback for title if empty
        if (!title) {
          title = card.find('img').attr('alt') || '';
        }

        const dateText = card.find('p.fecha').text().trim() || '';
        const venueText = card.find('p.descripcion strong').text().trim() || '';
        let image = card.find('img.img--evento').attr('src');
        if (!image) image = card.find('img').attr('src');
        
        const fullUrl = href.startsWith('http') ? href : `https://www.puntoticket.com${href}`;

        // Ensure we found something that looks like an event
        if (title && title.length > 2) {
          events.push({
            title: title.substring(0, 500),
            artistName: title.split(/ en | at | - /)[0].trim(), // Approx heuristic
            venueName: venueText || 'Por definir',
            date: parseSpanishDate(dateText),
            imageUrl: image,
            ticketUrl: fullUrl
          });
        }
      });

      return events;
    } catch (error) {
      console.error('PuntoTicketScraper Error:', error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }
}
