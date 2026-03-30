import {
  type AnyPgColumn,
  index,
  boolean,
  date,
  pgEnum,
  pgTable,
  integer,
  numeric,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('USER'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dishesTable = pgTable('dishes', {
  id: integer('id').generatedByDefaultAsIdentity().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  weight: integer('weight').notNull(),
  calories: integer('calories').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  ingredients: text('ingredients')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  imageUrl: text('image_url').notNull(),
  isSpicy: boolean('is_spicy').notNull().default(false),
  isChildFriendly: boolean('is_child_friendly').notNull().default(false),
  allergens: text('allergens')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

export const reviewsTable = pgTable('reviews', {
  id: integer('id').generatedByDefaultAsIdentity().primaryKey(),
  dishId: integer('dish_id')
    .notNull()
    .references((): AnyPgColumn => dishesTable.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  text: text('text').notNull(),
  photoUrl: text('photo_url').notNull(),
  rating: integer('rating').notNull(),
});

export const hallsTable = pgTable('halls', {
  id: integer('id').generatedByDefaultAsIdentity().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
});

export const tablesTable = pgTable('tables', {
  id: integer('id').generatedByDefaultAsIdentity().primaryKey(),
  hallId: integer('hall_id')
    .notNull()
    .references((): AnyPgColumn => hallsTable.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  seats: integer('seats').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
});

export const bookingsTable = pgTable(
  'bookings',
  {
    id: integer('id').generatedByDefaultAsIdentity().primaryKey(),
    userId: uuid('user_id').references((): AnyPgColumn => usersTable.id, { onDelete: 'set null' }),
    tableId: integer('table_id')
      .notNull()
      .references((): AnyPgColumn => tablesTable.id, { onDelete: 'cascade' }),
    hallId: integer('hall_id')
      .notNull()
      .references((): AnyPgColumn => hallsTable.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    guestName: text('guest_name').notNull(),
    phone: text('phone').notNull(),
    guestsCount: integer('guests_count').notNull(),
  },
  (table) => [
    index('bookings_table_id_date_idx').on(table.tableId, table.date),
    index('bookings_user_id_idx').on(table.userId),
  ],
);

export const refreshTokensTable = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references((): AnyPgColumn => usersTable.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('refresh_tokens_user_id_idx').on(table.userId),
  ],
);
