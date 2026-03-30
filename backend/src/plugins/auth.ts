import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';
import type { Env } from '../types.js';

export const registerAuth = async (app: FastifyInstance, env: Env): Promise<void> => {
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

  app.decorate('authenticate', async function authenticate(request: FastifyRequest) {
    try {
      await request.jwtVerify();
    } catch {
      throw new AppError(401, 'Unauthorized');
    }
  });

  app.decorate('requireAdmin', async function requireAdmin(request: FastifyRequest) {
    await app.authenticate(request);
    if (request.user.role !== 'ADMIN') {
      throw new AppError(403, 'Admin access required');
    }
  });
}
