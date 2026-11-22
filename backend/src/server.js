const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

async function start() {
  try {
    await connectDatabase();
    // eslint-disable-next-line no-console
    console.log(`[DB] Connected to MongoDB (${env.nodeEnv})`);

    const server = app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[SERVER] Listening on http://localhost:${env.port}`);
      // eslint-disable-next-line no-console
      console.log(`[DOCS] Swagger at http://localhost:${env.port}/api-docs`);
    });

    const shutdown = async (signal) => {
      // eslint-disable-next-line no-console
      console.log(`\n[SERVER] ${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
}

start();