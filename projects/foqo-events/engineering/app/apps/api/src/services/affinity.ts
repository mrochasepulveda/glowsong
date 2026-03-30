import { db } from '../db/index.js';
import { userEventSignals, userGenreAffinity, userArtistAffinity, artistGenres } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Signal value lookup — the API sets this, not the client.
 * Positive = interest, negative = disinterest.
 */
export const SIGNAL_VALUES: Record<string, number> = {
  view_details: 0.3,
  save: 1.0,
  unsave: -0.3,
  voy: 1.5,
  skip: -0.2,
  dismiss: -1.0,
};

/**
 * After recording a signal, recompute genre and artist affinities
 * for the given user based on ALL their signal history.
 */
export async function updateAffinities(userId: string, artistId: string) {
  // 1. Get all genres for this artist
  const artistGenreRows = await db
    .select({ genreId: artistGenres.genreId })
    .from(artistGenres)
    .where(eq(artistGenres.artistId, artistId));

  // 2. For each genre, aggregate signals across all artists with that genre
  for (const { genreId } of artistGenreRows) {
    const result = await db.execute(sql`
      SELECT
        COALESCE(SUM(s.value), 0)::real AS sum_val,
        COUNT(*)::int AS cnt
      FROM riff.user_event_signals s
      JOIN riff.artist_genres ag ON ag.artist_id = s.artist_id
      WHERE s.user_id = ${userId}
        AND ag.genre_id = ${genreId}
    `);

    const rows = (result as any).rows ?? result;
    const row = rows[0] as Record<string, any> | undefined;
    const sumVal = parseFloat(row?.sum_val ?? '0');
    const cnt = parseInt(row?.cnt ?? '0', 10);

    // weight: 1.0 = neutral (onboarding default)
    // range: 0.1 (hates) to 2.0 (loves)
    const weight = cnt === 0 ? 1.0 : Math.max(0.1, Math.min(2.0, 1.0 + sumVal / cnt));

    await db.execute(sql`
      INSERT INTO riff.user_genre_affinity (user_id, genre_id, weight, signal_count, last_updated)
      VALUES (${userId}, ${genreId}, ${weight}, ${cnt}, NOW())
      ON CONFLICT (user_id, genre_id)
      DO UPDATE SET weight = ${weight}, signal_count = ${cnt}, last_updated = NOW()
    `);
  }

  // 3. Update artist-level affinity
  const artistResult = await db.execute(sql`
    SELECT
      COALESCE(SUM(value), 0)::real AS sum_val,
      COUNT(*)::int AS cnt
    FROM riff.user_event_signals
    WHERE user_id = ${userId} AND artist_id = ${artistId}
  `);

  const aRows = (artistResult as any).rows ?? artistResult;
  const aRow = aRows[0] as Record<string, any> | undefined;
  const aSum = parseFloat(aRow?.sum_val ?? '0');
  const aCnt = parseInt(aRow?.cnt ?? '0', 10);

  // range: -1.0 (strong negative) to +1.0 (strong positive)
  const artistWeight = aCnt === 0 ? 0.0 : Math.max(-1.0, Math.min(1.0, aSum / aCnt));

  await db.execute(sql`
    INSERT INTO riff.user_artist_affinity (user_id, artist_id, weight, signal_count, last_updated)
    VALUES (${userId}, ${artistId}, ${artistWeight}, ${aCnt}, NOW())
    ON CONFLICT (user_id, artist_id)
    DO UPDATE SET weight = ${artistWeight}, signal_count = ${aCnt}, last_updated = NOW()
  `);
}
