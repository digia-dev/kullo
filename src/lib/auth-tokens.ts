import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { authTokens } from "@/db/schema";
import { hashToken } from "@/lib/password";
import { newId, nowISO } from "@/lib/utils";

export type AuthTokenKind = "reset" | "verify";

export async function issueAuthToken(userId: string, kind: AuthTokenKind, ttlMs: number) {
  const raw = crypto.randomBytes(24).toString("base64url");
  await db.insert(authTokens).values({
    id: newId("tok"),
    userId,
    kind,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    createdAt: nowISO(),
  });
  return raw;
}

export async function findAuthToken(raw: string, kind: AuthTokenKind) {
  return (
    await db
      .select()
      .from(authTokens)
      .where(
        and(
          eq(authTokens.tokenHash, hashToken(raw)),
          eq(authTokens.kind, kind),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, nowISO()),
        ),
      )
  )[0];
}

export async function consumeAuthToken(id: string) {
  await db.update(authTokens).set({ usedAt: nowISO() }).where(eq(authTokens.id, id));
}
