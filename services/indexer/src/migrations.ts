import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { query } from "./db.js";
import { logger } from "./logger.js";

async function ensureMigrationsTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
}

export async function runMigrations() {
  await ensureMigrationsTable();

  const sqlDir = resolve(process.cwd(), "services", "indexer", "sql");
  const files = (await readdir(sqlDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const { rows } = await query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM migrations WHERE name = $1) AS exists",
      [file],
    );
    const alreadyRan = rows[0]?.exists ?? false;
    if (alreadyRan) {
      logger.debug({ file }, "Migration already applied");
      continue;
    }

    const fullPath = resolve(sqlDir, file);
    const sql = await readFile(fullPath, "utf8");

    logger.info({ file }, "Applying migration");
    await query(sql);
    await query("INSERT INTO migrations (name) VALUES ($1)", [file]);
  }
}
