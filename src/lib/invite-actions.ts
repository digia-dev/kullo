"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { memberships, users } from "@/db/schema";
import { createSession, hashInviteToken } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { nowISO } from "@/lib/utils";

export type InviteState = { error?: string };

export async function acceptInviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { error: "Tautan undangan tidak valid." };
  const membership = (await db
    .select()
    .from(memberships)
    .where(eq(memberships.inviteTokenHash, hashInviteToken(token))))[0];
  if (!membership || membership.status !== "invited") return { error: "Undangan tidak ditemukan atau sudah digunakan." };
  if (membership.inviteExpiresAt && membership.inviteExpiresAt < nowISO()) return { error: "Undangan sudah kedaluwarsa. Minta tautan baru dari administrator." };
  const user = (await db.select().from(users).where(eq(users.id, membership.userId)))[0];
  if (!user) return { error: "Akun undangan tidak ditemukan." };

  const isNew = user.title === "Anggota baru";
  if (isNew) {
    const name = String(formData.get("name") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (name.length < 2) return { error: "Nama minimal 2 karakter." };
    if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
    await db.update(users).set({ name, passwordHash: hashPassword(password), title: "Anggota" }).where(eq(users.id, user.id));
  } else {
    const current = String(formData.get("currentPassword") ?? "");
    if (!verifyPassword(current, user.passwordHash)) return { error: "Kata sandi akun Anda tidak cocok. Periksa ejaan, lalu coba lagi." };
  }

  await db.update(users).set({ emailVerifiedAt: nowISO() }).where(eq(users.id, user.id));

  await db.update(memberships)
    .set({ status: "active", inviteTokenHash: null, inviteExpiresAt: null, joinedAt: nowISO() })
    .where(eq(memberships.id, membership.id));

  await createSession(user.id);
  redirect("/app/dashboard");
}
