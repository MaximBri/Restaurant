export async function healthRoutes(app) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['System'],
        summary: 'Проверка доступности сервера',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
  );
}
