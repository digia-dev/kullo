import "./load-env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to run migrations.");
}

// Migrations need a session connection (not the transaction pooler), because
// some DDL and advisory locks do not survive transaction pooling.
const client = postgres(connectionString, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === "false" ? false : "require",
});

const db = drizzle({ client });

async function main() {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await client.end();
  console.log("Migrations applied.");
}

main().catch(async (error) => {
  console.error(error);
  await client.end().catch(() => {});
  process.exit(1);
});
