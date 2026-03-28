import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';

import { AppError } from '../lib/errors.js';

export async function registerAuth(app, env) {
  await app.register(fastifyCookie);

  await app.register(fastifyJwt, {
    secret: env.jwtSecret,
    cookie: {
      cookieName: env.accessTokenCookie,
      signed: false,
    },
    sign: {
      expiresIn: env.accessTokenTtl,
    },
  });

  app.decorate('authenticate', async function authenticate(request) {
    try {
      await request.jwtVerify();
    } catch {
      throw new AppError(401, 'Unauthorized');
    }
  });

  app.decorate('requireAdmin', async function requireAdmin(request) {
    await app.authenticate(request);

    if (request.user.role !== 'ADMIN') {
      throw new AppError(403, 'Admin access required');
    }
  });
}
