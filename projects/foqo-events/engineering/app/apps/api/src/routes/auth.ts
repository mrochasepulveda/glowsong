import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles, userGenrePreferences, eventInterests, genres } from '../db/schema.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

export async function authRoutes(app: FastifyInstance) {

  // ── POST /api/auth/signup ──────────────────────────────
  app.post<{
    Body: { email: string; password: string; displayName?: string };
  }>('/api/auth/signup', async (request, reply) => {
    const { email, password, displayName } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email y contraseña requeridos' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for dev
      user_metadata: { display_name: displayName || email.split('@')[0] },
    });

    if (error) {
      const msg = error.message.includes('already been registered')
        ? 'Este correo ya está registrado'
        : error.message;
      return reply.status(400).send({ error: msg });
    }

    // The trigger in DB auto-creates the profile, but update city/name if provided
    const user = data.user;

    // Sign in to get a session
    const { data: session, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    // Issue our own JWT
    const token = app.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name || email.split('@')[0],
      },
    };
  });

  // ── POST /api/auth/login ───────────────────────────────
  app.post<{
    Body: { email: string; password: string };
  }>('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email y contraseña requeridos' });
    }

    // Verify credentials via Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return reply.status(401).send({ error: 'Credenciales incorrectas' });
    }

    const user = data.user;

    // Fetch profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    // Issue JWT
    const token = app.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: profile?.displayName || user.user_metadata?.display_name || email.split('@')[0],
        city: profile?.city || null,
        avatarUrl: profile?.avatarUrl || null,
      },
    };
  });

  // ── GET /api/auth/me ───────────────────────────────────
  app.get('/api/auth/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.userId!;

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

    if (!profile) {
      return reply.status(404).send({ error: 'Perfil no encontrado' });
    }

    // Get genre preferences
    const genrePrefs = await db
      .select({ genreId: userGenrePreferences.genreId, name: genres.name, slug: genres.slug })
      .from(userGenrePreferences)
      .innerJoin(genres, eq(userGenrePreferences.genreId, genres.id))
      .where(eq(userGenrePreferences.userId, userId));

    // Get saved events
    const interests = await db
      .select({ eventId: eventInterests.eventId })
      .from(eventInterests)
      .where(eq(eventInterests.userId, userId));

    return {
      id: profile.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      city: profile.city,
      notifyPush: profile.notifyPush,
      notifyEmail: profile.notifyEmail,
      notifyWhatsapp: profile.notifyWhatsapp,
      genres: genrePrefs.map(g => g.slug),
      savedEventIds: interests.map(i => i.eventId),
    };
  });

  // ── POST /api/auth/onboarding ──────────────────────────
  // Saves all onboarding data: city, vibes (genres), notification prefs, saved events
  app.post<{
    Body: {
      displayName?: string;      // name collected in step 0
      city: string;
      vibes: string[];           // genre slugs from VIBES mapping
      frequency?: string;        // 'never' | 'few' | 'regular' | 'addict'
      channels: string[];        // 'push' | 'email' | 'whatsapp'
      savedEventIds: string[];   // event IDs saved during onboarding swipe
    };
  }>('/api/auth/onboarding', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.userId!;
    const { displayName, city, vibes, frequency, channels, savedEventIds } = request.body;

    // 1. Update profile with name, city, frequency + notification prefs
    await db.update(profiles).set({
      ...(displayName ? { displayName } : {}),
      city: city || undefined,
      notifyPush: channels.includes('push'),
      notifyEmail: channels.includes('email'),
      notifyWhatsapp: channels.includes('whatsapp'),
      updatedAt: new Date(),
    }).where(eq(profiles.id, userId));

    // 2. Save genre preferences (vibes → genre slugs)
    if (vibes.length > 0) {
      // First clear existing
      await db.delete(userGenrePreferences).where(eq(userGenrePreferences.userId, userId));

      // Map vibe IDs to genre slugs
      const VIBE_TO_GENRES: Record<string, string[]> = {
        'raw-energy': ['rock', 'metal', 'punk', 'hardcore'],
        'dance-floor': ['techno', 'house', 'electronica', 'drum-and-bass'],
        'flow': ['hip-hop', 'trap', 'reggaeton', 'urbano'],
        'chill': ['jazz', 'folk', 'indie', 'ambient'],
        'latin': ['cumbia', 'latin', 'reggae', 'ska'],
        'everything': [], // No specific genres
      };

      const slugs = vibes.flatMap(v => VIBE_TO_GENRES[v] || []);
      if (slugs.length > 0) {
        // Find matching genre IDs
        const matchingGenres = await db
          .select({ id: genres.id, slug: genres.slug })
          .from(genres);

        const genreIds = matchingGenres
          .filter(g => slugs.includes(g.slug))
          .map(g => g.id);

        if (genreIds.length > 0) {
          await db.insert(userGenrePreferences).values(
            genreIds.map(genreId => ({ userId, genreId }))
          );
        }
      }
    }

    // 3. Save event interests
    if (savedEventIds.length > 0) {
      // Clear existing
      await db.delete(eventInterests).where(eq(eventInterests.userId, userId));

      await db.insert(eventInterests).values(
        savedEventIds.map(eventId => ({ userId, eventId }))
      );
    }

    return { success: true };
  });
}
