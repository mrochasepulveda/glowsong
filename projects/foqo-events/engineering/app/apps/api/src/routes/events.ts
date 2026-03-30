import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { events, artists, venues } from '../db/schema.js';
import { eq, gte, desc, asc, sql, and } from 'drizzle-orm';

export async function eventRoutes(app: FastifyInstance) {

  // GET /api/events — List events with filters
  app.get('/api/events', async (request, reply) => {
    const { city, status, dateFrom, dateTo, page = '1', perPage = '20', sortBy = 'date' } = request.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(50, Math.max(1, parseInt(perPage)));
    const offset = (pageNum - 1) * limit;

    const conditions = [];
    if (city) conditions.push(eq(venues.city, city));
    if (status) conditions.push(eq(events.status, status as any));
    if (dateFrom) conditions.push(gte(events.date, new Date(dateFrom)));
    if (dateTo) conditions.push(sql`${events.date} <= ${new Date(dateTo)}`);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = sortBy === 'recent'
      ? desc(events.createdAt)
      : asc(events.date);

    const results = await db
      .select({
        event: events,
        artist: artists,
        venue: venues,
      })
      .from(events)
      .innerJoin(artists, eq(events.artistId, artists.id))
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(where);

    return {
      success: true,
      data: results.map(r => ({
        ...r.event,
        artist: r.artist,
        venue: r.venue,
      })),
      meta: {
        page: pageNum,
        perPage: limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  });

  // GET /api/events/:id — Get single event
  app.get('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const results = await db
      .select({
        event: events,
        artist: artists,
        venue: venues,
      })
      .from(events)
      .innerJoin(artists, eq(events.artistId, artists.id))
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(eq(events.id, id))
      .limit(1);

    if (results.length === 0) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Event not found' },
      });
    }

    const r = results[0];
    return {
      success: true,
      data: { ...r.event, artist: r.artist, venue: r.venue },
    };
  });

  // POST /api/events — Create event
  app.post('/api/events', async (request, reply) => {
    const body = request.body as any;

    const [event] = await db.insert(events).values({
      title: body.title,
      artistId: body.artistId,
      venueId: body.venueId,
      date: new Date(body.date),
      doorsOpen: body.doorsOpen ? new Date(body.doorsOpen) : null,
      priceMin: body.priceMin || null,
      priceMax: body.priceMax || null,
      currency: body.currency || 'CLP',
      ticketUrl: body.ticketUrl || null,
      imageUrl: body.imageUrl || null,
      description: body.description || null,
      status: body.status || 'confirmed',
      source: body.source,
      sourceUrl: body.sourceUrl || null,
    }).returning();

    return reply.status(201).send({ success: true, data: event });
  });

  // PUT /api/events/:id — Update event
  app.put('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (body.title) updateData.title = body.title;
    if (body.date) updateData.date = new Date(body.date);
    if (body.doorsOpen !== undefined) updateData.doorsOpen = body.doorsOpen ? new Date(body.doorsOpen) : null;
    if (body.priceMin !== undefined) updateData.priceMin = body.priceMin;
    if (body.priceMax !== undefined) updateData.priceMax = body.priceMax;
    if (body.ticketUrl !== undefined) updateData.ticketUrl = body.ticketUrl;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status) updateData.status = body.status;

    const [event] = await db.update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    if (!event) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Event not found' },
      });
    }

    return { success: true, data: event };
  });

  // DELETE /api/events/:id — Delete event
  app.delete('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [event] = await db.delete(events)
      .where(eq(events.id, id))
      .returning();

    if (!event) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Event not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });
}
