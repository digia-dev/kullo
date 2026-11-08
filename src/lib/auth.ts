import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db } from "@/db/client";
import { memberships, organizations, sessions, users } from "@/db/schema";
import { hashToken } from "./password";

export { hashPassword, verifyPassword } from "./password";

const COOKIE = "kullo_session";
const SESSION_DAYS = 7;

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.insert(sessions)
    .values({
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(token),
      expiresAt: expires.toISOString(),
    })
    .run();
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token))).run();
  }
  jar.delete(COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = db
    .select({
      user: users,
      sessionId: sessions.id,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date().toISOString())))
    .get();
  return row?.user ?? null;
}

export type AppContext = {
  user: typeof users.$inferSelect;
  membership: typeof memberships.$inferSelect;
  org: typeof organizations.$inferSelect;
};

export async function getAppContext(): Promise<AppContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const row = db
    .select({ membership: memberships, org: organizations })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.orgId))
    .where(and(eq(memberships.userId, user.id), eq(memberships.status, "active")))
    .get();
  if (!row) return null;
  return { user, membership: row.membership, org: row.org };
}

export async function requireApp(): Promise<AppContext> {
  const ctx = await getAppContext();
  if (!ctx) redirect("/masuk?next=/app/dashboard");
  return ctx;
}

export async function requireAdmin(): Promise<AppContext> {
  const ctx = await requireApp();
  if (!["owner", "admin"].includes(ctx.membership.role)) {
    redirect("/app/dashboard?denied=1");
  }
  return ctx;
}

export function newInviteToken() {
  const token = crypto.randomBytes(24).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashInviteToken(token: string) {
  return hashToken(token);
}
