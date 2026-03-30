import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { profiles, events, artists, venues, scrapingSources, notifications } from '../db/schema.js';
import { sql, gte } from 'drizzle-orm';

export async function statsRoutes(app: FastifyInstance) {

  // GET /api/stats — Dashboard stats for admin
  app.get('/api/stats', async () => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [[userCount], [eventCount], [artistCount], [venueCount], [weekEvents], [todayNotifs], [activeSources]] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(profiles),
      db.select({ count: sql<number>`count(*)::int` }).from(events),
      db.select({ count: sql<number>`count(*)::int` }).from(artists),
      db.select({ count: sql<number>`count(*)::int` }).from(venues),
      db.select({ count: sql<number>`count(*)::int` }).from(events)
        .where(sql`${events.date} >= ${now} AND ${events.date} <= ${weekFromNow}`),
      db.select({ count: sql<number>`count(*)::int` }).from(notifications)
        .where(gte(notifications.createdAt, todayStart)),
      db.select({ count: sql<number>`count(*)::int` }).from(scrapingSources)
        .where(sql`${scrapingSources.isActive} = true`),
    ]);

    return {
      success: true,
      data: {
        totalUsers: userCount.count,
        totalEvents: eventCount.count,
        totalArtists: artistCount.count,
        totalVenues: venueCount.count,
        eventsThisWeek: weekEvents.count,
        notificationsSentToday: todayNotifs.count,
        scrapingSourcesActive: activeSources.count,
        lastScrapingRun: null,
      },
    };
  });
}
