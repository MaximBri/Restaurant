import { eq } from 'drizzle-orm';

import { getEnv } from '../src/config/env.js';
import { getDb, closeDb } from '../src/db/index.js';
import { usersTable } from '../src/db/schema.js';
import { hashPassword } from '../src/utils/password.js';

async function run() {
  const env = getEnv();
  const db = getDb();

  try {
    const existingAdmin = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, env.adminEmail),
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const passwordHash = await hashPassword(env.adminPassword);

    await db.insert(usersTable).values({
      email: env.adminEmail,
      name: env.adminName,
      passwordHash,
      role: 'ADMIN',
    });

    console.log(`Admin created: ${env.adminEmail}`);
  } finally {
    await closeDb();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
