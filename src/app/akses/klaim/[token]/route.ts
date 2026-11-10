import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { accessRequests } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = (await db.select().from(accessRequests).where(eq(accessRequests.token, token)))[0];
  if (!row || row.status !== "approved" || !row.userId) {
    redirect("/masuk?expired=1");
  }
  await db.update(accessRequests).set({ claimedAt: nowISO(), updatedAt: nowISO() }).where(eq(accessRequests.id, row.id));
  await createSession(row.userId);
  redirect("/app/dashboard");
}
