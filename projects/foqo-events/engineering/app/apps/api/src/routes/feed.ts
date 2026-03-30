import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import {
  events, artists, venues, artistGenres, genres,
  userGenrePreferences, userGenreAffinity, userArtistAffinity, userArtistFollows,
} from '../db/schema.js';
import { eq, gte, asc, sql, and, inArray } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

/**
 * Feed endpoint — returns events ranked by learned affinity.
 *
 * Score formula:
 *   genreScore    (0-50) — weighted genre overlap using learned weights
 *   artistScore   (0-25) — direct artist affinity from signals
 *   popBonus      (0-10) — artist popularity
 *   urgencyBonus  (0-10) — temporal proximity
 *   followBonus   (0 or 5) — user follows artist
 *   Total: 0-100
 */

export async function feedRoutes(app: FastifyInstance) {

  app.get('/api/feed', { preHandler: [requireAuth] }, async (request) => {
    const userId = request.userId!;
    const { city, limit: limitStr = '50' } = request.query as Record<string, string>;
    const limit = Math.min(100, Math.max(1, parseInt(limitStr) || 50));
    const now = new Date();

    // ── 1. User data (parallel) ──────────────────────────
    const [userGenres, genreAffinities, artistAffinities, followedArtists] = await Promise.all([
      db.select({ genreId: userGenrePreferences.genreId })
        .from(userGenrePreferences)
        .where(eq(userGenrePreferences.userId, userId)),

      db.select({ genreId: userGenreAffinity.genreId, weight: userGenreAffinity.weight })
        .from(userGenreAffinity)
        .where(eq(userGenreAffinity.userId, userId)),

      db.select({ artistId: userArtistAffinity.artistId, weight: userArtistAffinity.weight })
        .from(userArtistAffinity)
        .where(eq(userArtistAffinity.userId, userId)),

      db.select({ artistId: userArtistFollows.artistId })
        .from(userArtistFollows)
        .where(eq(userArtistFollows.userId, userId)),
    ]);

    const userGenreIdSet = new Set(userGenres.map(g => g.genreId));
    const genreAffinityMap = new Map(genreAffinities.map(a => [a.genreId, a.weight]));
    const artistAffinityMap = new Map(artistAffinities.map(a => [a.artistId, a.weight]));
    const followedSet = new Set(followedArtists.map(f => f.artistId));

    // ── 2. Upcoming events ───────────────────────────────
    const conditions = [gte(events.date, now)];
    if (city) conditions.push(eq(venues.city, city));

    const upcomingEvents = await db
      .select({ event: events, artist: artists, venue: venues })
      .from(events)
      .innerJoin(artists, eq(events.artistId, artists.id))
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(and(...conditions))
      .orderBy(asc(events.date))
      .limit(limit);

    if (upcomingEvents.length === 0) {
      return { success: true, data: [], meta: { total: 0, hasPreferences: userGenreIdSet.size > 0 } };
    }

    // ── 3. Artist genres (batch) ─────────────────────────
    const artistIds = [...new Set(upcomingEvents.map(e => e.artist.id))];

    const allArtistGenres = artistIds.length > 0
      ? await db.select({ artistId: artistGenres.artistId, genreId: artistGenres.genreId })
          .from(artistGenres)
          .where(inArray(artistGenres.artistId, artistIds))
      : [];

    const artistGenreMap = new Map<string, Set<string>>();
    for (const ag of allArtistGenres) {
      if (!artistGenreMap.has(ag.artistId)) artistGenreMap.set(ag.artistId, new Set());
      artistGenreMap.get(ag.artistId)!.add(ag.genreId);
    }

    // Genre names for match reasons
    const allGenreIds = [...new Set(allArtistGenres.map(ag => ag.genreId))];
    const genreNames = allGenreIds.length > 0
      ? await db.select({ id: genres.id, name: genres.name }).from(genres).where(inArray(genres.id, allGenreIds))
      : [];
    const genreNameMap = new Map(genreNames.map(g => [g.id, g.name]));

    // ── 4. Score each event ──────────────────────────────
    const scored = upcomingEvents.map(row => {
      const artistGIds = artistGenreMap.get(row.artist.id) || new Set<string>();
      const daysAway = (new Date(row.event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      let genreScore = 0;
      let artistScore = 12; // neutral default
      let matchReason = '';
      let topGenreName = '';
      let topGenreWeight = 0;

      if (userGenreIdSet.size > 0 && artistGIds.size > 0) {
        // ── Genre score (0-50): weighted overlap ──
        let weightedOverlap = 0;
        let maxPossibleWeight = 0;

        for (const genreId of artistGIds) {
          const affinity = genreAffinityMap.get(genreId);
          const isUserGenre = userGenreIdSet.has(genreId);

          if (affinity !== undefined) {
            // Learned weight (0.1-2.0)
            weightedOverlap += affinity;
            maxPossibleWeight += 2.0;
            const name = genreNameMap.get(genreId) || '';
            if (affinity > topGenreWeight && name) { topGenreWeight = affinity; topGenreName = name; }
          } else if (isUserGenre) {
            // Onboarding preference, no signals yet — neutral 1.0
            weightedOverlap += 1.0;
            maxPossibleWeight += 2.0;
            const name = genreNameMap.get(genreId) || '';
            if (1.0 > topGenreWeight && name) { topGenreWeight = 1.0; topGenreName = name; }
          }
          // Genre not in user preferences AND no affinity → contributes 0
        }

        genreScore = maxPossibleWeight > 0
          ? Math.round((weightedOverlap / maxPossibleWeight) * 50)
          : 0;
      }

      // ── Artist score (0-25): learned from signals ──
      const aWeight = artistAffinityMap.get(row.artist.id);
      if (aWeight !== undefined) {
        // Range -1.0 to +1.0 → map to 0-25
        artistScore = Math.round(((aWeight + 1.0) / 2.0) * 25);
      }

      // ── Bonuses ──
      const popBonus = Math.round(((row.artist.popularity || 50) / 100) * 10);
      const urgencyBonus = daysAway <= 3 ? 10 : daysAway <= 7 ? 6 : daysAway <= 14 ? 3 : 0;
      const followBonus = followedSet.has(row.artist.id) ? 5 : 0;

      const matchScore = Math.min(99, genreScore + artistScore + popBonus + urgencyBonus + followBonus);

      // ── Match reason ──
      if (aWeight !== undefined && aWeight > 0.3) {
        matchReason = `Te gustaron eventos de ${row.artist.name}`;
      } else if (followedSet.has(row.artist.id)) {
        matchReason = `Sigues a ${row.artist.name}`;
      } else if (topGenreName) {
        matchReason = `Porque te gusta ${topGenreName}`;
      } else if (matchScore <= 25) {
        matchReason = '';
      } else {
        matchReason = 'Popular en tu ciudad';
      }

      return {
        ...row.event,
        artist: row.artist,
        venue: row.venue,
        matchScore,
        matchReason,
      };
    });

    // Sort by matchScore desc, date asc for ties
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return {
      success: true,
      data: scored,
      meta: {
        total: scored.length,
        hasPreferences: userGenreIdSet.size > 0,
      },
    };
  });
}
