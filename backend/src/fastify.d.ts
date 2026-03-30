import 'fastify';
import '@fastify/jwt';

import type { FastifyRequest } from 'fastify';

import type { Db } from './db/index.js';
import type { AuthJwtUser, Env } from './types.js';

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
    db: Db;
    authenticate(request: FastifyRequest): Promise<void>;
    requireAdmin(request: FastifyRequest): Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthJwtUser & { jti: string };
    user: AuthJwtUser;
  }
}
