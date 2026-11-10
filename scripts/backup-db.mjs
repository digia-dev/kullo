import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const checkOnly = process.argv.includes("--check");
const source = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "kullo.db");
const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "data", "backups");

if (!fs.existsSync(source)) {
  console.error(`Database tidak ditemukan: ${source}`);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = path.join(backupDir, `kullo-${stamp}.db`);

const db = new Database(source, { readonly: true });
try {
  await db.backup(target);
} finally {
  db.close();
}

if (checkOnly) {
  const copy = new Database(target, { readonly: true });
  try {
    const integrity = copy.pragma("integrity_check", { simple: true });
    const tables = copy.prepare("select count(*) as count from sqlite_master where type = 'table'").get().count;
    const sourceDb = new Database(source, { readonly: true });
    const sourceTables = sourceDb
      .prepare("select count(*) as count from sqlite_master where type = 'table'")
      .get().count;
    sourceDb.close();
    if (integrity !== "ok" || tables !== sourceTables) {
      console.error(`Backup gagal diverifikasi: integrity=${integrity}, tables=${tables}/${sourceTables}`);
      process.exit(1);
    }
    console.log(`Backup terverifikasi: ${target} (${tables} tabel, integrity ok)`);
  } finally {
    copy.close();
  }
} else {
  console.log(`Backup dibuat: ${target}`);
}
