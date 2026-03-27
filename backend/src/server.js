import { buildApp } from './app.js';

async function start() {
  const { app, env } = await buildApp();

  try {
    await app.listen({
      port: env.port,
      host: env.host,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
