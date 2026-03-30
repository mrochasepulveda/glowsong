/// <reference lib="dom" />
import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { IScraperSource, ScrapedEvent } from '../core/ScraperEngine.js';
import { ClaudeParser } from '../core/ClaudeParser.js';

// Activate stealth plugin to avoid anti-bot detection
chromium.use(stealth());

export class InstagramScraper implements IScraperSource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async scrape(): Promise<ScrapedEvent[]> {
    let browser = null;

    try {
      console.log(`InstagramScraper: Launching invisible browser for ${this.url}`);
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'es-ES',
      });
      
      const page = await context.newPage();
      
      console.log(`InstagramScraper: Navigating to ${this.url}`);
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait briefly for React app to render the initial DOM (we want the public profile grid texts)
      await page.waitForTimeout(4000);

      // We might get hit with a login wall quickly, so extract everything fast
      // Extract every visible piece of text in hopes it caught the latest post captions
      const rawTextNodes = await page.evaluate(() => {
        // Find main content or spans
        const elements = (window as any).document.querySelectorAll('span, p, h1, h2, h3, a');
        return Array.from(elements)
          .map(el => (el as any).innerText || '')
          .filter(text => text.trim().length > 10) // Filter out noise
          .join('\n\n---POST OR ELEMENT SEPARATOR---\n\n');
      });

      console.log(`📸 Extracted ${rawTextNodes.length} characters of raw text from Instagram. Parsing...`);

      if (rawTextNodes.length < 50) {
        console.warn('⚠️ No useful text found. Instagram might have blocked the profile or require login.');
        return [];
      }

      // We now pass this chaotic text to Claude!
      const aiEvents = await ClaudeParser.extractEventsFromText(rawTextNodes, this.url);
      
      return aiEvents;
      
    } catch (error) {
      console.error('InstagramScraper Error:', error);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}
