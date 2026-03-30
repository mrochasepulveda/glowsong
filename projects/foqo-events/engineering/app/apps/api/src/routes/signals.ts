import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { userEventSignals, events } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { SIGNAL_VALUES, updateAffinities } from '../services/affinity.js';

const VALID_SIGNALS = Object.keys(SIGNAL_VALUES);

export async function signalRoutes(app: FastifyInstance) {

  // POST /api/signals — Record a user signal on an event
  app.post<{
    Body: {
      eventId: string;
      artistId: string;
      signalType: string;
      context?: Record<string, unknown>;
    };
  }>('/api/signals', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.userId!;
    const { eventId, artistId, signalType, context } = request.body;

    if (!eventId || !artistId || !signalType) {
      return reply.status(400).send({ error: 'eventId, artistId, and signalType required' });
    }

    if (!VALID_SIGNALS.includes(signalType)) {
      return reply.status(400).send({ error: `Invalid signalType. Valid: ${VALID_SIGNALS.join(', ')}` });
    }

    const value = SIGNAL_VALUES[signalType];

    // Insert signal
    await db.insert(userEventSignals).values({
      userId,
      eventId,
      artistId,
      signalType: signalType as any,
      value,
      context: context || null,
    });

    // Recompute affinities inline (fast enough for <100 users)
    await updateAffinities(userId, artistId);

    return { success: true };
  });

  // POST /api/signals/batch — Record multiple signals at once
  app.post<{
    Body: {
      signals: { eventId: string; artistId: string; signalType: string; context?: Record<string, unknown> }[];
    };
  }>('/api/signals/batch', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.userId!;
    const { signals } = request.body;

    if (!Array.isArray(signals) || signals.length === 0) {
      return reply.status(400).send({ error: 'signals array required' });
    }

    const artistIds = new Set<string>();

    for (const sig of signals) {
      if (!VALID_SIGNALS.includes(sig.signalType)) continue;

      await db.insert(userEventSignals).values({
        userId,
        eventId: sig.eventId,
        artistId: sig.artistId,
        signalType: sig.signalType as any,
        value: SIGNAL_VALUES[sig.signalType],
        context: sig.context || null,
      });

      artistIds.add(sig.artistId);
    }

    // Recompute affinities for all affected artists
    for (const artistId of artistIds) {
      await updateAffinities(userId, artistId);
    }

    return { success: true, recorded: signals.length };
  });
}
