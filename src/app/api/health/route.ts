import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, describeDatabaseTarget } from "@/db/client";
import { usingSupabaseStorage } from "@/lib/storage";

export async function GET() {
  const at = new Date().toISOString();
  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    const target = describeDatabaseTarget();
    return NextResponse.json(
      {
        ok: false,
        service: "kullo",
        at,
        database: "down",
        host: target.host,
        hint: target.ok
          ? "Host terbaca valid tetapi kueri gagal: periksa password, port, dan SSL."
          : target.problem,
        error: error instanceof Error ? error.message : "database check failed",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({
    ok: true,
    service: "kullo",
    at,
    database: "up",
    storage: usingSupabaseStorage() ? "supabase" : "local",
  });
}
