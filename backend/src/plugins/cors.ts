import fastifyCors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

export const registerCors = async (
  app: FastifyInstance,
  corsOrigin: string,
): Promise<void> => {
  await app.register(fastifyCors, {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
};
