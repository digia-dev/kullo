import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { accessRequests } from "@/db/schema";
import { getAppContext } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/mail";
import { getObject } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAppContext();
  if (!ctx || !isPlatformAdmin(ctx.user.email)) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const row = (await db.select().from(accessRequests).where(eq(accessRequests.id, id)))[0];
  if (!row?.paymentProofKey) return new Response("Not found", { status: 404 });
  try {
    const data = await getObject(row.paymentProofKey);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(row.paymentProofKey.split("/").pop() ?? "bukti")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Berkas tidak ditemukan.", { status: 404 });
  }
}
