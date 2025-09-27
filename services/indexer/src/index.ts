import { pool, shutdownDatabase } from "./db.js";
import { logger } from "./logger.js";
import { runMigrations } from "./migrations.js";
import { startApiServer } from "./api-server.js";
import { startWorker } from "./worker.js";

async function bootstrap() {
  logger.info("Bootstrapping KASFundME indexer");
  const client = await pool.connect();
  client.release();

  await runMigrations();

  void startWorker();
  await startApiServer();
}

bootstrap().catch((error) => {
  logger.error({ error }, "Indexer bootstrap failed");
  shutdownDatabase().finally(() => process.exit(1));
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down");
  shutdownDatabase().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down");
  shutdownDatabase().finally(() => process.exit(0));
});
