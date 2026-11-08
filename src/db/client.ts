import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "kullo.db");

function create() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return drizzle(sqlite, { schema });
}

type DB = ReturnType<typeof create>;

const globalForDb = globalThis as unknown as { __kulloDb?: DB };

export const db: DB = globalForDb.__kulloDb ?? create();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__kulloDb = db;
}

export { schema };
