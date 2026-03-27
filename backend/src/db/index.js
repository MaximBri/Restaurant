import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getEnv } from '../config/env.js';
import * as schema from './schema.js';

let poolInstance;
let dbInstance;

export function getDb() {
  if (!dbInstance) {
    const env = getEnv();

    poolInstance = new Pool({
      connectionString: env.databaseUrl,
    });

    dbInstance = drizzle(poolInstance, { schema });
  }

  return dbInstance;
}

export async function closeDb() {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = undefined;
    dbInstance = undefined;
  }
}
