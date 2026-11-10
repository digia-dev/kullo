import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString: string = process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Copy .env.example to .env and set the Supabase connection string.",
  );
}

/**
 * Supabase transaction pooler does not support prepared statements, and a
 * serverless deployment opens many short-lived instances, so keep the pool
 * small and prepare disabled. `max: 1` is the Supabase recommendation for
 * serverless; it is also safe for the local dev server.
 */
function create() {
  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: process.env.DATABASE_SSL === "false" ? false : "require",
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle({ client, schema });
}

type DB = ReturnType<typeof create>;

const globalForDb = globalThis as unknown as { __kulloDb?: DB };

export const db: DB = globalForDb.__kulloDb ?? create();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__kulloDb = db;
}

export { schema };
