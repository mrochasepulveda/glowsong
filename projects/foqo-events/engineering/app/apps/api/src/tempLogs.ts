import { db } from './db/index.js';
import { scrapingLogs, scrapingSources } from './db/schema.js';
import { desc, eq } from 'drizzle-orm';

async function main() {
  const logs = await db.select({
    sourceName: scrapingSources.name,
    status: scrapingLogs.status,
    durationMs: scrapingLogs.durationMs,
    eventsFound: scrapingLogs.eventsFound,
    eventsNew: scrapingLogs.eventsNew
  })
  .from(scrapingLogs)
  .leftJoin(scrapingSources, eq(scrapingLogs.sourceId, scrapingSources.id))
  .orderBy(desc(scrapingLogs.createdAt))
  .limit(10);

  console.log(JSON.stringify(logs, null, 2));
  process.exit(0);
}

main();
