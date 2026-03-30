import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getEnv } from '../config/env.js';
import * as schema from './schema.js';

let poolInstance: Pool | undefined;
let dbInstance: Db | undefined;

export type Db = NodePgDatabase<typeof schema>;

export const getDb = (): Db => {
  if (!dbInstance) {
    const env = getEnv();

    poolInstance = new Pool({
      connectionString: env.databaseUrl,
    });

    dbInstance = drizzle(poolInstance, { schema });
  }

  return dbInstance;
};

export const closeDb = async (): Promise<void> => {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = undefined;
    dbInstance = undefined;
  }
};
