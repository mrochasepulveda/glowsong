import pg from 'pg';
import { config } from './config/env.js';

async function main() {
  const client = new pg.Client(config.database.url);
  try {
    await client.connect();
    await client.query("ALTER TYPE riff.scraping_source_type ADD VALUE IF NOT EXISTS 'passline'");
    await client.query("ALTER TYPE riff.scraping_source_type ADD VALUE IF NOT EXISTS 'ticketplus'");
    console.log('Enum updated');
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
main();
