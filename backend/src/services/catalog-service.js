import { and, asc, desc, eq, ilike, lte, gte, sql } from 'drizzle-orm';

import {
  bookingsTable,
  dishesTable,
  hallsTable,
  reviewsTable,
  tablesTable,
  usersTable,
} from '../db/schema.js';
import { AppError } from '../lib/errors.js';

function normalizeDish(row) {
  return {
    ...row,
    price: Number(row.price),
  };
}

function toTextArraySql(values) {
  return sql`ARRAY[${sql.join(values.map((value) => sql`${value}`), sql`, `)}]::text[]`;
}

export async function listDishes(db, filters) {
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
}

export async function getDishById(db, id) {
  const dish = await db.query.dishesTable.findFirst({
    where: eq(dishesTable.id, id),
  });

  if (!dish) {
    throw new AppError(404, 'Блюдо не найдено');
  }

  return normalizeDish(dish);
}

export function listReviewsByDish(db, dishId) {
  return db.query.reviewsTable.findMany({
    where: eq(reviewsTable.dishId, dishId),
    orderBy: [asc(reviewsTable.id)],
  });
}

export function listHalls(db) {
  return db.query.hallsTable.findMany({
    orderBy: [asc(hallsTable.id)],
  });
}

export async function listTablesByHall(db, hallId) {
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
}

export async function listBookings(db, hallId, date) {
  return db.query.bookingsTable.findMany({
    where: and(eq(bookingsTable.hallId, hallId), eq(bookingsTable.date, date)),
    orderBy: [asc(bookingsTable.tableId), asc(bookingsTable.id)],
  });
}

export async function createBookingRecord(db, payload, userId) {
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
}

export async function listAdminBookings(db) {
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
}

export async function deleteBookingRecord(db, bookingId) {
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
}
