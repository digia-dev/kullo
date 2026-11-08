import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "kullo.db");
for (const suffix of ["", "-wal", "-shm"]) {
  const file = dbPath + suffix;
  if (fs.existsSync(file)) fs.rmSync(file);
}
console.log("Database removed. Run npm run db:setup to rebuild.");
