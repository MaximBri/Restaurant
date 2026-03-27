import { deleteBookingRecord, listAdminBookings } from '../services/catalog-service.js';

export async function adminRoutes(app) {
  app.get(
    '/bookings',
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ['Admin'],
        summary: 'Все бронирования для панели администратора',
        security: [{ bearerAuth: [] }],
      },
    },
    async () => listAdminBookings(app.db),
  );

  app.delete(
    '/bookings/:id',
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: ['Admin'],
        summary: 'Удалить бронирование',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      await deleteBookingRecord(app.db, request.params.id);
      reply.status(204).send();
    },
  );
}
