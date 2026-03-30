import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

import {
  bookingsTable,
  dishesTable,
  hallsTable,
  reviewsTable,
  tablesTable,
} from '../src/db/schema.js';
import { closeDb, getDb } from '../src/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = process.env.STATIC_DATA_PATH
  ? path.resolve(process.env.STATIC_DATA_PATH)
  : path.resolve(__dirname, '../../client/db.json');

type StaticData = {
  dishes: Array<InferInsertModel<typeof dishesTable>>;
  reviews: Array<InferInsertModel<typeof reviewsTable>>;
  halls: Array<InferInsertModel<typeof hallsTable>>;
  tables: Array<InferInsertModel<typeof tablesTable>>;
  bookings: Array<InferInsertModel<typeof bookingsTable>>;
};

async function syncIdentitySequence(
  tx: Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0],
  tableName: string,
  columnName = 'id',
): Promise<void> {
  await tx.execute(
    sql.raw(`
      SELECT setval(
        pg_get_serial_sequence('${tableName}', '${columnName}'),
        COALESCE((SELECT MAX(${columnName}) FROM ${tableName}), 1),
        true
      );
    `),
  );
}

async function run(): Promise<void> {
  const db = getDb();
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const data = JSON.parse(raw) as StaticData;

  try {
    await db.transaction(async (tx) => {
      await tx.delete(bookingsTable);
      await tx.delete(reviewsTable);
      await tx.delete(tablesTable);
      await tx.delete(hallsTable);
      await tx.delete(dishesTable);

      await tx.insert(dishesTable).values(data.dishes);
      await tx.insert(reviewsTable).values(data.reviews);
      await tx.insert(hallsTable).values(data.halls);
      await tx.insert(tablesTable).values(data.tables);
      await tx.insert(bookingsTable).values(
        data.bookings.map((booking) => ({
          ...booking,
          userId: null,
        })),
      );

      await syncIdentitySequence(tx, 'dishes');
      await syncIdentitySequence(tx, 'reviews');
      await syncIdentitySequence(tx, 'halls');
      await syncIdentitySequence(tx, 'tables');
      await syncIdentitySequence(tx, 'bookings');
    });

    console.log('Static data imported from client/db.json');
  } finally {
    await closeDb();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
