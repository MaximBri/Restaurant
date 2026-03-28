import {
  createBookingRecord,
  getDishById,
  listBookings,
  listDishes,
  listHalls,
  listReviewsByDish,
  listTablesByHall,
} from '../services/catalog-service.js';
import { AppError } from '../lib/errors.js';

const dishQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    search: { type: 'string' },
    category: { type: 'string' },
    minCalories: { type: 'integer', minimum: 0 },
    maxCalories: { type: 'integer', minimum: 0 },
    minWeight: { type: 'integer', minimum: 0 },
    maxWeight: { type: 'integer', minimum: 0 },
    isSpicy: { type: 'boolean' },
    isChildFriendly: { type: 'boolean' },
    excludeAllergens: {
      anyOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' },
        },
      ],
    },
  },
};

const bookingBodySchema = {
  type: 'object',
  required: ['tableId', 'hallId', 'date', 'guestName', 'phone', 'guestsCount'],
  additionalProperties: false,
  properties: {
    tableId: { type: 'integer', minimum: 1 },
    hallId: { type: 'integer', minimum: 1 },
    date: { type: 'string', format: 'date' },
    guestName: { type: 'string', minLength: 2, maxLength: 100 },
    phone: {
      type: 'string',
      minLength: 5,
      maxLength: 30,
      pattern: '^[+\\d\\s()-]+$',
    },
    guestsCount: { type: 'integer', minimum: 1, maximum: 20 },
  },
};

function normalizePhone(value) {
  const trimmed = value.trim();
  const normalized = trimmed.replace(/[()\s-]/g, '');

  if (normalized.startsWith('8')) {
    return `+7${normalized.slice(1)}`;
  }

  if (normalized.startsWith('7')) {
    return `+${normalized}`;
  }

  return normalized;
}

function validatePhone(value) {
  const normalized = normalizePhone(value);

  if (!/^(\+7|7)\d{10}$/.test(normalized)) {
    throw new AppError(400, 'Введите корректный номер телефона');
  }

  return normalized;
}

function normalizeAllergens(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function catalogRoutes(app) {
  app.get(
    '/dishes',
    {
      schema: {
        tags: ['Catalog'],
        summary: 'Список блюд',
        querystring: dishQuerySchema,
      },
    },
    async (request) => {
      const query = request.query;

      return listDishes(app.db, {
        search: query.search?.trim(),
        category: query.category?.trim(),
        minCalories: query.minCalories,
        maxCalories: query.maxCalories,
        minWeight: query.minWeight,
        maxWeight: query.maxWeight,
        isSpicy: query.isSpicy,
        isChildFriendly: query.isChildFriendly,
        excludeAllergens: normalizeAllergens(query.excludeAllergens),
      });
    },
  );

  app.get(
    '/dishes/:id',
    {
      schema: {
        tags: ['Catalog'],
        summary: 'Получить блюдо по id',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (request) => getDishById(app.db, request.params.id),
  );

  app.get(
    '/reviews',
    {
      schema: {
        tags: ['Catalog'],
        summary: 'Отзывы по блюду',
        querystring: {
          type: 'object',
          required: ['dishId'],
          properties: {
            dishId: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (request) => listReviewsByDish(app.db, request.query.dishId),
  );

  app.get(
    '/halls',
    {
      schema: {
        tags: ['Booking'],
        summary: 'Список залов',
      },
    },
    async () => listHalls(app.db),
  );

  app.get(
    '/tables',
    {
      schema: {
        tags: ['Booking'],
        summary: 'Список столиков зала',
        querystring: {
          type: 'object',
          required: ['hallId'],
          properties: {
            hallId: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (request) => listTablesByHall(app.db, request.query.hallId),
  );

  app.get(
    '/bookings',
    {
      schema: {
        tags: ['Booking'],
        summary: 'Бронирования по залу и дате',
        querystring: {
          type: 'object',
          required: ['hallId', 'date'],
          properties: {
            hallId: { type: 'integer', minimum: 1 },
            date: { type: 'string', format: 'date' },
          },
        },
      },
    },
    async (request) => listBookings(app.db, request.query.hallId, request.query.date),
  );

  app.post(
    '/bookings',
    {
      schema: {
        tags: ['Booking'],
        summary: 'Создать бронирование',
        body: bookingBodySchema,
      },
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const booking = await createBookingRecord(
        app.db,
        {
          ...request.body,
          phone: validatePhone(request.body.phone),
        },
        request.user.id,
      );
      reply.status(201).send(booking);
    },
  );
}
