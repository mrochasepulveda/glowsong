import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { genres } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export async function genreRoutes(app: FastifyInstance) {

  // GET /api/genres — List all genres
  app.get('/api/genres', async () => {
    const results = await db.select().from(genres).orderBy(genres.name);
    return { success: true, data: results };
  });

  // POST /api/genres — Create genre
  app.post('/api/genres', async (request, reply) => {
    const body = request.body as any;

    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [genre] = await db.insert(genres).values({
      name: body.name,
      slug,
      parentId: body.parentId || null,
    }).returning();

    return reply.status(201).send({ success: true, data: genre });
  });

  // DELETE /api/genres/:id
  app.delete('/api/genres/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [genre] = await db.delete(genres).where(eq(genres.id, id)).returning();

    if (!genre) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Genre not found' } });
    }
    return { success: true, data: { deleted: true } };
  });
}
