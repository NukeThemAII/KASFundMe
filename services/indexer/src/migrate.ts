import { pool, shutdownDatabase } from "./db.js";
import { logger } from "./logger.js";
import { runMigrations } from "./migrations.js";

(async () => {
  const client = await pool.connect();
  client.release();

  try {
    await runMigrations();
    logger.info("Migrations complete");
  } catch (error) {
    logger.error({ error }, "Migration failed");
    process.exitCode = 1;
  } finally {
    await shutdownDatabase();
  }
})();
