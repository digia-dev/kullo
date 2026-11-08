import { eq } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/db/client";
import { documents } from "@/db/schema";
import { getAppContext } from "@/lib/auth";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  txt: "text/plain; charset=utf-8",
  md: "text/plain; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  xls: "application/vnd.ms-excel",
  ppt: "application/vnd.ms-powerpoint",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAppContext();
  if (!ctx) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const doc = db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc || doc.orgId !== ctx.org.id) return new Response("Not found", { status: 404 });
  if (!doc.storageKey) {
    return new Response("File ini adalah metadata contoh dan tidak memiliki berkas tersimpan.", { status: 404 });
  }
  const absolute = path.join(process.cwd(), "data", "uploads", doc.storageKey);
  try {
    const data = await fs.readFile(absolute);
    const url = new URL(request.url);
    const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[doc.kind] ?? "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(doc.name)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Berkas tidak ditemukan di penyimpanan.", { status: 404 });
  }
}
