import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { consumeAuthToken, findAuthToken } from "@/lib/auth-tokens";
import { nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await findAuthToken(token, "verify");
  if (!row) redirect("/masuk?expired=1");
  await db.update(users).set({ emailVerifiedAt: nowISO() }).where(eq(users.id, row.userId));
  await consumeAuthToken(row.id);
  redirect("/masuk?verified=1");
}
