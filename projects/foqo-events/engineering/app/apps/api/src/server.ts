import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config/env.js';
import { eventRoutes } from './routes/events.js';
import { artistRoutes } from './routes/artists.js';
import { venueRoutes } from './routes/venues.js';
import { genreRoutes } from './routes/genres.js';
import { statsRoutes } from './routes/stats.js';
import { authRoutes } from './routes/auth.js';
import { feedRoutes } from './routes/feed.js';
import { signalRoutes } from './routes/signals.js';
import { startCronJobs } from './cron/scheduler.js';

const app = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'info' : 'warn',
    transport: config.nodeEnv === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

// ---- Plugins ----
await app.register(cors, {
  origin: [
    config.cors.webUrl,
    config.cors.mobileUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3006',
    'http://localhost:8081',
    'http://localhost:19006',
  ],
  credentials: true,
});

await app.register(jwt, {
  secret: config.jwt.secret,
});

// ---- Routes ----
await app.register(authRoutes);
await app.register(eventRoutes);
await app.register(artistRoutes);
await app.register(venueRoutes);
await app.register(genreRoutes);
await app.register(statsRoutes);
await app.register(feedRoutes);
await app.register(signalRoutes);

// ---- Health Check ----
app.get('/api/health', async () => {
  return { status: 'ok', service: 'foqo-api', version: '0.1.0' };
});

// Start cron jobs in the background
startCronJobs();

// ---- Start Server ----
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`
  ╔══════════════════════════════════════════╗
  ║          🎵  RIFF API v0.1.0  🎵         ║
  ║                                          ║
  ║  Server:  http://localhost:${config.port}        ║
  ║  Health:  http://localhost:${config.port}/api/health ║
  ║  Env:     ${config.nodeEnv.padEnd(28)}  ║
  ╚══════════════════════════════════════════╝
  `);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
