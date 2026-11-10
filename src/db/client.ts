import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString: string = process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Copy .env.example to .env and set the Supabase connection string.",
  );
}

export type DatabaseTarget =
  | { ok: true; host: string }
  | { ok: false; host: string | null; problem: string };

/**
 * Parses the connection string the same way `postgres` will, so configuration
 * mistakes surface as a readable health message instead of a bare ENOTFOUND.
 * The most common one: an unescaped "#" in the password turns the rest of the
 * URL into a fragment, and the host silently becomes the user name.
 */
export function describeDatabaseTarget(raw: string = connectionString): DatabaseTarget {
  const value = raw.trim();
  if (!value) {
    return { ok: false, host: null, problem: "DATABASE_URL belum diatur." };
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, host: null, problem: "DATABASE_URL tidak bisa dibaca sebagai URL Postgres." };
  }
  if (url.hash) {
    return {
      ok: false,
      host: url.hostname || null,
      problem:
        "URL terpotong oleh karakter '#' yang belum di-encode. Tulis # sebagai %23 (dan @ sebagai %40) di password.",
    };
  }
  if (!url.username || !url.password) {
    return { ok: false, host: url.hostname || null, problem: "URL tidak memuat user dan password." };
  }
  if (!url.hostname.includes(".")) {
    return { ok: false, host: url.hostname || null, problem: "Hostname database tidak lengkap." };
  }
  return { ok: true, host: url.hostname };
}

/**
 * Supabase transaction pooler does not support prepared statements, and a
 * serverless deployment opens many short-lived instances, so keep the pool
 * small and prepare disabled.
 *
 * `max` must be greater than 1: a server action and the render of its redirect
 * target can run at the same time, and a single connection makes the render
 * wait for the action until the framework's body timeout kills the response.
 * Three connections is enough for that overlap without exhausting the pooler.
 */
function create() {
  const client = postgres(connectionString, {
    max: 3,
    prepare: false,
    ssl: process.env.DATABASE_SSL === "false" ? false : "require",
    idle_timeout: 20,
    max_lifetime: 60 * 30,
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
