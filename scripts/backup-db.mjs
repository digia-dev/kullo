/**
 * Kullo backups are handled by Supabase: the project takes daily automated
 * backups (Point-in-Time Recovery on paid plans). This script verifies that the
 * database is reachable and reports table counts, so a deploy can check the
 * connection string without touching production data.
 *
 * Usage: npm run db:backup:check
 */
import { loadEnvFile } from "node:process";
import postgres from "postgres";

for (const file of [".env.local", ".env"]) {
  try {
    loadEnvFile(file);
  } catch {
    // optional
  }
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DIRECT_URL atau DATABASE_URL belum diatur.");
  process.exit(1);
}

const client = postgres(connectionString, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === "false" ? false : "require",
});

try {
  const rows = await client`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  console.log(`Database terhubung. ${rows.length} tabel publik.`);
  console.log(rows.map((row) => row.table_name).join(", "));
} catch (error) {
  console.error("Database tidak dapat diakses:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
