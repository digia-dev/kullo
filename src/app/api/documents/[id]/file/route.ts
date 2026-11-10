import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, documentVersions } from "@/db/schema";
import { getAppContext } from "@/lib/auth";
import { getObject } from "@/lib/storage";

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
  const doc = (await db.select().from(documents).where(eq(documents.id, id)))[0];
  if (!doc || doc.orgId !== ctx.org.id) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const versionId = url.searchParams.get("version");
  let storageKey = doc.storageKey;
  let kind = doc.kind;
  let name = doc.name;

  if (versionId) {
    const version = (
      await db
        .select()
        .from(documentVersions)
        .where(and(eq(documentVersions.id, versionId), eq(documentVersions.documentId, id)))
    )[0];
    if (!version?.storageKey) return new Response("Versi tidak memiliki berkas.", { status: 404 });
    storageKey = version.storageKey;
    kind = version.kind ?? doc.kind;
    name = version.name ?? doc.name;
  }

  if (!storageKey) {
    return new Response("File ini adalah metadata contoh dan tidak memiliki berkas tersimpan.", { status: 404 });
  }

  try {
    const data = await getObject(storageKey);
    const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[kind] ?? "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(name)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Berkas tidak ditemukan di penyimpanan.", { status: 404 });
  }
}
