import fastifyCors from '@fastify/cors';

export async function registerCors(app, corsOrigin) {
  await app.register(fastifyCors, {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
}
