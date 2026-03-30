import { buildApp } from './app.js';
import { closeDb } from './db/index.js';

async function start(): Promise<void> {
  const { app, env } = await buildApp();

  try {
    await app.listen({
      port: env.port,
      host: env.host,
    });
  } catch (error) {
    app.log.error(error);
    await closeDb();
    process.exit(1);
  }
}

start();
