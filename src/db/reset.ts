import "./load-env";
import postgres from "postgres";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to reset the database.");
}

const client = postgres(connectionString, {
  max: 1,
  prepare: false,
  ssl: process.env.DATABASE_SSL === "false" ? false : "require",
});

async function main() {
  await client.unsafe("DROP SCHEMA public CASCADE");
  await client.unsafe("CREATE SCHEMA public");
  await client.end();
  console.log("Database schema dropped. Run npm run db:setup to rebuild.");
}

main().catch(async (error) => {
  console.error(error);
  await client.end().catch(() => {});
  process.exit(1);
});
