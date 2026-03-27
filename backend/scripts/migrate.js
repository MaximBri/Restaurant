import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { getDb, closeDb } from '../src/db/index.js';

async function run() {
  try {
    const db = getDb();
    await migrate(db, {
      migrationsFolder: './drizzle',
    });
    console.log('Migrations applied');
  } finally {
    await closeDb();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
