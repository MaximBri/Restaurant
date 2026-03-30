import { and, asc, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

import type { Db } from '../db/index.js';
import {
  bookingsTable,
  dishesTable,
  hallsTable,
  reviewsTable,
  tablesTable,
  usersTable,
} from '../db/schema.js';
import { AppError } from '../lib/errors.js';
import type { BookingPayload, DishFilters } from '../types.js';

type DishRow = InferSelectModel<typeof dishesTable>;

const normalizeDish = (row: DishRow) => {
  return {
    ...row,
    price: Number(row.price),
  };
};

const toTextArraySql = (values: string[]) => {
  return sql`ARRAY[${sql.join(values.map((value) => sql`${value}`), sql`, `)}]::text[]`;
};

export const listDishes = async (db: Db, filters: DishFilters) => {
  const conditions = [];

  if (filters.search) {
    conditions.push(ilike(dishesTable.name, `%${filters.search}%`));
  }

  if (filters.category) {
    conditions.push(eq(dishesTable.category, filters.category));
  }

  if (filters.minCalories !== undefined) {
    conditions.push(gte(dishesTable.calories, filters.minCalories));
  }

  if (filters.maxCalories !== undefined) {
    conditions.push(lte(dishesTable.calories, filters.maxCalories));
  }

  if (filters.minWeight !== undefined) {
    conditions.push(gte(dishesTable.weight, filters.minWeight));
  }

  if (filters.maxWeight !== undefined) {
    conditions.push(lte(dishesTable.weight, filters.maxWeight));
  }

  if (filters.isSpicy !== undefined) {
    conditions.push(eq(dishesTable.isSpicy, filters.isSpicy));
  }

  if (filters.isChildFriendly !== undefined) {
    conditions.push(eq(dishesTable.isChildFriendly, filters.isChildFriendly));
  }

  if (filters.excludeAllergens?.length) {
    const allergensArray = toTextArraySql(filters.excludeAllergens);

    conditions.push(
      sql`not (${dishesTable.allergens} && ${allergensArray})`,
    );
  }

  const rows = await db.query.dishesTable.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [asc(dishesTable.category), asc(dishesTable.name)],
  });

  return rows.map(normalizeDish);
};

export const getDishById = async (db: Db, id: number) => {
  const dish = await db.query.dishesTable.findFirst({
    where: eq(dishesTable.id, id),
  });

  if (!dish) {
    throw new AppError(404, 'Блюдо не найдено');
  }

  return normalizeDish(dish);
};

export const listReviewsByDish = (db: Db, dishId: number) => {
  return db.query.reviewsTable.findMany({
    where: eq(reviewsTable.dishId, dishId),
    orderBy: [asc(reviewsTable.id)],
  });
};

export const listHalls = (db: Db) => {
  return db.query.hallsTable.findMany({
    orderBy: [asc(hallsTable.id)],
  });
};

export const listTablesByHall = async (db: Db, hallId: number) => {
  const hall = await db.query.hallsTable.findFirst({
    where: eq(hallsTable.id, hallId),
  });

  if (!hall) {
    throw new AppError(404, 'Зал не найден');
  }

  return db.query.tablesTable.findMany({
    where: eq(tablesTable.hallId, hallId),
    orderBy: [asc(tablesTable.number)],
  });
};

export const listBookings = async (db: Db, hallId: number, date: string) => {
  return db.query.bookingsTable.findMany({
    where: and(eq(bookingsTable.hallId, hallId), eq(bookingsTable.date, date)),
    orderBy: [asc(bookingsTable.tableId), asc(bookingsTable.id)],
  });
};

export const createBookingRecord = async (
  db: Db,
  payload: BookingPayload,
  userId: string,
) => {
  const table = await db.query.tablesTable.findFirst({
    where: eq(tablesTable.id, payload.tableId),
  });

  if (!table) {
    throw new AppError(404, 'Столик не найден');
  }

  if (table.hallId !== payload.hallId) {
    throw new AppError(400, 'Столик не относится к выбранному залу');
  }

  if (payload.guestsCount > table.seats) {
    throw new AppError(400, 'Количество гостей превышает вместимость столика');
  }

  const existingBooking = await db.query.bookingsTable.findFirst({
    where: and(
      eq(bookingsTable.tableId, payload.tableId),
      eq(bookingsTable.date, payload.date),
    ),
  });

  if (existingBooking) {
    throw new AppError(409, 'Столик уже забронирован на эту дату');
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      ...payload,
      userId,
    })
    .returning();

  return booking;
};

export const listAdminBookings = async (db: Db) => {
  const rows = await db
    .select({
      id: bookingsTable.id,
      userId: bookingsTable.userId,
      tableId: bookingsTable.tableId,
      hallId: bookingsTable.hallId,
      date: bookingsTable.date,
      guestName: bookingsTable.guestName,
      phone: bookingsTable.phone,
      guestsCount: bookingsTable.guestsCount,
      hallName: hallsTable.name,
      tableNumber: tablesTable.number,
      creatorName: usersTable.name,
      creatorEmail: usersTable.email,
    })
    .from(bookingsTable)
    .innerJoin(hallsTable, eq(bookingsTable.hallId, hallsTable.id))
    .innerJoin(tablesTable, eq(bookingsTable.tableId, tablesTable.id))
    .leftJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
    .orderBy(desc(bookingsTable.date), asc(hallsTable.name), asc(tablesTable.number));

  return rows;
};

export const deleteBookingRecord = async (db: Db, bookingId: number) => {
  const [booking] = await db
    .delete(bookingsTable)
    .where(eq(bookingsTable.id, bookingId))
    .returning({
      id: bookingsTable.id,
    });

  if (!booking) {
    throw new AppError(404, 'Бронирование не найдено');
  }

  return booking;
};
