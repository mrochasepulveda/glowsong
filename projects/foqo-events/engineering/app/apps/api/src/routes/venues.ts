import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { venues } from '../db/schema.js';
import { eq, ilike, sql } from 'drizzle-orm';

export async function venueRoutes(app: FastifyInstance) {

  // GET /api/venues — List/search venues
  app.get('/api/venues', async (request, reply) => {
    const { q, city, page = '1', perPage = '20' } = request.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(50, Math.max(1, parseInt(perPage)));
    const offset = (pageNum - 1) * limit;

    const conditions = [];
    if (q) conditions.push(ilike(venues.name, `%${q}%`));
    if (city) conditions.push(eq(venues.city, city));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const results = await db.select().from(venues).where(where).orderBy(venues.name).limit(limit).offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(venues).where(where);

    return {
      success: true,
      data: results,
      meta: { page: pageNum, perPage: limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  });

  // GET /api/venues/:id
  app.get('/api/venues/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [venue] = await db.select().from(venues).where(eq(venues.id, id)).limit(1);

    if (!venue) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Venue not found' } });
    }
    return { success: true, data: venue };
  });

  // POST /api/venues
  app.post('/api/venues', async (request, reply) => {
    const body = request.body as any;

    const [venue] = await db.insert(venues).values({
      name: body.name,
      city: body.city,
      address: body.address || null,
      capacity: body.capacity || null,
      imageUrl: body.imageUrl || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      instagramHandle: body.instagramHandle || null,
    }).returning();

    return reply.status(201).send({ success: true, data: venue });
  });

  // PUT /api/venues/:id
  app.put('/api/venues/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const updateData: Record<string, any> = {};
    if (body.name) updateData.name = body.name;
    if (body.city) updateData.city = body.city;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.instagramHandle !== undefined) updateData.instagramHandle = body.instagramHandle;

    const [venue] = await db.update(venues).set(updateData).where(eq(venues.id, id)).returning();

    if (!venue) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Venue not found' } });
    }
    return { success: true, data: venue };
  });

  // DELETE /api/venues/:id
  app.delete('/api/venues/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [venue] = await db.delete(venues).where(eq(venues.id, id)).returning();

    if (!venue) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Venue not found' } });
    }
    return { success: true, data: { deleted: true } };
  });
}
