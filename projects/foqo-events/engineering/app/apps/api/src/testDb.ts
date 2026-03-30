import { db } from './db/index.js';
import { artists } from './db/schema.js';
import { eq, ilike } from 'drizzle-orm';

async function main() {
  console.log('Testing DB connection...');
  try {
    console.log('Querying artist...');
    const result = await db.select().from(artists).where(ilike(artists.name, "EDO CAROE")).limit(1);
    console.log('Query result:', result);

    if (result.length === 0) {
      console.log('Inserting artist...');
      const [newArtist] = await db.insert(artists).values({ name: 'EDO CAROE', popularity: 50 }).returning();
      console.log('Inserted:', newArtist);
    }
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Test DB error:', error);
    process.exit(1);
  }
}

main();
