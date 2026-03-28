import Fastify from 'fastify';

import { getEnv } from './config/env.js';
import { getDb } from './db/index.js';
import { registerAuth } from './plugins/auth.js';
import { registerCors } from './plugins/cors.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { registerSwagger } from './plugins/swagger.js';
import { authRoutes } from './routes/auth.js';
import { adminRoutes } from './routes/admin.js';
import { catalogRoutes } from './routes/catalog.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp() {
  const env = getEnv();
  const db = getDb();

  const app = Fastify({
    logger: {
      level: env.logLevel,
      transport: env.nodeEnv === 'development'
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

  app.decorate('env', env);
  app.decorate('db', db);

  await registerCors(app, env.corsOrigin);
  await registerSwagger(app);
  await registerAuth(app, env);

  registerErrorHandler(app);

  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(catalogRoutes, { prefix: '/api' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(authRoutes, { prefix: '/api/auth' });

  return { app, env };
}
