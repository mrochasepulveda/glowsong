import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { artists, artistGenres, genres } from '../db/schema.js';
import { eq, ilike, sql } from 'drizzle-orm';

export async function artistRoutes(app: FastifyInstance) {

  // GET /api/artists — List/search artists
  app.get('/api/artists', async (request, reply) => {
    const { q, page = '1', perPage = '20' } = request.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(50, Math.max(1, parseInt(perPage)));
    const offset = (pageNum - 1) * limit;

    const where = q ? ilike(artists.name, `%${q}%`) : undefined;

    const results = await db
      .select()
      .from(artists)
      .where(where)
      .orderBy(artists.name)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(artists)
      .where(where);

    // Fetch genres for each artist
    const artistIds = results.map(a => a.id);
    const genreRows = artistIds.length > 0
      ? await db
          .select({ artistId: artistGenres.artistId, genre: genres })
          .from(artistGenres)
          .innerJoin(genres, eq(artistGenres.genreId, genres.id))
          .where(sql`${artistGenres.artistId} IN ${artistIds}`)
      : [];

    const genreMap = new Map<string, string[]>();
    for (const row of genreRows) {
      const existing = genreMap.get(row.artistId) || [];
      existing.push(row.genre.name);
      genreMap.set(row.artistId, existing);
    }

    return {
      success: true,
      data: results.map(a => ({
        ...a,
        genres: genreMap.get(a.id) || [],
      })),
      meta: {
        page: pageNum,
        perPage: limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  });

  // GET /api/artists/:id — Get single artist
  app.get('/api/artists/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [artist] = await db.select().from(artists).where(eq(artists.id, id)).limit(1);

    if (!artist) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Artist not found' },
      });
    }

    const genreRows = await db
      .select({ genre: genres })
      .from(artistGenres)
      .innerJoin(genres, eq(artistGenres.genreId, genres.id))
      .where(eq(artistGenres.artistId, id));

    return {
      success: true,
      data: { ...artist, genres: genreRows.map(r => r.genre.name) },
    };
  });

  // POST /api/artists — Create artist
  app.post('/api/artists', async (request, reply) => {
    const body = request.body as any;

    const [artist] = await db.insert(artists).values({
      name: body.name,
      imageUrl: body.imageUrl || null,
      popularity: body.popularity || null,
      country: body.country || null,
      isLocal: body.isLocal || false,
    }).returning();

    // Link genres if provided
    if (body.genreIds && body.genreIds.length > 0) {
      await db.insert(artistGenres).values(
        body.genreIds.map((gId: string) => ({
          artistId: artist.id,
          genreId: gId,
        }))
      );
    }

    return reply.status(201).send({ success: true, data: artist });
  });

  // PUT /api/artists/:id — Update artist
  app.put('/api/artists/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.popularity !== undefined) updateData.popularity = body.popularity;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.isLocal !== undefined) updateData.isLocal = body.isLocal;

    const [artist] = await db.update(artists)
      .set(updateData)
      .where(eq(artists.id, id))
      .returning();

    if (!artist) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Artist not found' },
      });
    }

    return { success: true, data: artist };
  });

  // DELETE /api/artists/:id
  app.delete('/api/artists/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [artist] = await db.delete(artists).where(eq(artists.id, id)).returning();

    if (!artist) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Artist not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });
}
