import Fastify from 'fastify';

import { getEnv } from './config/env.js';
import { registerCors } from './plugins/cors.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp() {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.logLevel,
      transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
  });

  await registerCors(app, env.corsOrigin);
  await app.register(healthRoutes, { prefix: '/api' });

  return { app, env };
}
