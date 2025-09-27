import { Pool, PoolClient, QueryConfig, QueryResult } from "pg";
import { config } from "./config.js";
import { logger } from "./logger.js";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

pool.on("error", (error) => {
  logger.error({ error }, "Postgres pool error");
});

export async function query<T = unknown>(
  text: string | QueryConfig<any[]>,
  params?: any[],
): Promise<QueryResult<T>> {
  if (typeof text === "string") {
    return pool.query<T>(text, params);
  }
  return pool.query<T>(text);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function shutdownDatabase() {
  await pool.end();
}
