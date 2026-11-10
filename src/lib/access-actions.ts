"use server";

import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { accessRequests, mailOutbox } from "@/db/schema";
import { requireApp } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { provisionWorkspace } from "@/lib/provision";
import { appUrl, adminEmails, isPlatformAdmin, sendMail } from "@/lib/mail";
import { putObject, contentTypeFor } from "@/lib/storage";
import { newId, nowISO } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export type RequestState = { ok?: boolean; error?: string; message?: string; statusUrl?: string };

const PLANS: Record<string, string> = {
  free: "Gratis",
  pro: "Pro (harga belum ditetapkan)",
  business: "Business (sesuai kebutuhan)",
};

function token() {
  return crypto.randomBytes(24).toString("base64url");
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function emailOk(value: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

async function notifyAdmins(request: { id: string; kind: string; companyName: string; contactName: string; email: string; plan: string }) {
  const label = request.kind === "demo" ? "Permintaan demo" : "Permintaan pendaftaran";
  const body = [
    `${label} baru untuk Kullo.`,
    "",
    `Perusahaan: ${request.companyName}`,
    `Nama: ${request.contactName}`,
    `Email: ${request.email}`,
    `Paket: ${PLANS[request.plan] ?? request.plan}`,
    "",
    `Tinjau di ${appUrl()}/app/admin/akses`,
  ].join("\n");
  for (const to of adminEmails()) {
    await sendMail({ to, subject: `${label}: ${request.companyName}`, body, kind: "admin-notification", requestId: request.id });
  }
}

export async function requestDemoAction(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const companyName = text(formData, "companyName");
  const contactName = text(formData, "contactName");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone") || null;

  if (companyName.length < 2) return { error: "Nama perusahaan minimal 2 karakter." };
  if (contactName.length < 2) return { error: "Nama Anda minimal 2 karakter." };
  if (!emailOk(email)) return { error: "Alamat email belum valid." };
  const limit = rateLimit(`demo:${email}`, 3, 60 * 60_000);
  if (!limit.allowed) return { error: "Permintaan demo sudah dikirim. Tunggu balasan admin." };

  const id = newId("acc");
  const raw = token();
  await db.insert(accessRequests).values({
    id,
    kind: "demo",
    companyName,
    contactName,
    email,
    phone,
    plan: "free",
    status: "pending",
    token: raw,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
  await notifyAdmins({ id, kind: "demo", companyName, contactName, email, plan: "free" });
  return { ok: true, message: "Permintaan demo terkirim. Admin akan memverifikasi lalu mengirim tautan akses ke email Anda." };
}

export async function requestSignupAction(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const name = text(formData, "name");
  const orgName = text(formData, "orgName");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = text(formData, "phone") || null;
  const plan = text(formData, "plan") || "free";

  if (name.length < 2) return { error: "Nama minimal 2 karakter." };
  if (orgName.length < 2) return { error: "Nama organisasi minimal 2 karakter." };
  if (!emailOk(email)) return { error: "Alamat email belum valid." };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (!PLANS[plan]) return { error: "Pilih paket yang tersedia." };

  const limit = rateLimit(`signup:${email}`, 3, 60 * 60_000);
  if (!limit.allowed) return { error: "Pendaftaran untuk email ini sudah dikirim. Tunggu kontak admin." };

  const existing = (
    await db.select({ id: accessRequests.id }).from(accessRequests).where(and(eq(accessRequests.email, email), eq(accessRequests.status, "pending")))
  )[0];
  if (existing) return { error: "Pendaftaran untuk email ini sedang ditinjau." };

  const id = newId("acc");
  const raw = token();
  await db.insert(accessRequests).values({
    id,
    kind: "signup",
    companyName: orgName,
    contactName: name,
    email,
    phone,
    plan,
    status: "pending",
    passwordHash: hashPassword(password),
    token: raw,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
  await notifyAdmins({ id, kind: "signup", companyName: orgName, contactName: name, email, plan });
  return {
    ok: true,
    message: "Pendaftaran terkirim. Admin akan menghubungi Anda melalui email/WhatsApp untuk invoice. Setelah bukti bayar diterima, tautan masuk dikirim ke email ini.",
    statusUrl: `/akses/status/${raw}`,
  };
}

export async function uploadPaymentProofAction(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const raw = text(formData, "token");
  const file = formData.get("proof");
  if (!raw) return { error: "Tautan tidak valid." };
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih berkas bukti pembayaran." };
  if (file.size > 8 * 1024 * 1024) return { error: "Ukuran berkas maksimal 8 MB." };

  const request = (await db.select().from(accessRequests).where(eq(accessRequests.token, raw)))[0];
  if (!request) return { error: "Permintaan tidak ditemukan." };
  if (!["pending", "invoice_sent"].includes(request.status)) {
    return { error: "Bukti pembayaran tidak dapat diunggah pada status ini." };
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const key = `access-proofs/${request.id}-${Date.now()}-${safe}`;
  await putObject(key, Buffer.from(await file.arrayBuffer()), contentTypeFor(file.name));
  await db
    .update(accessRequests)
    .set({ paymentProofKey: key, status: "proof_received", updatedAt: nowISO() })
    .where(eq(accessRequests.id, request.id));

  await sendMail({
    to: request.email,
    subject: "Bukti pembayaran diterima",
    body: `Terima kasih. Bukti pembayaran untuk ${request.companyName} sudah kami terima dan akan diverifikasi admin.`,
    kind: "payment-proof",
    requestId: request.id,
  });
  revalidatePath(`/akses/status/${raw}`);
  return { ok: true, message: "Bukti pembayaran terkirim. Admin akan memverifikasi." };
}

export async function markInvoiceSentAction(formData: FormData) {
  const ctx = await requireApp();
  if (!isPlatformAdmin(ctx.user.email)) throw new Error("Tidak berwenang.");
  const id = text(formData, "id");
  const request = (await db.select().from(accessRequests).where(eq(accessRequests.id, id)))[0];
  if (!request) return;
  await db.update(accessRequests).set({ status: "invoice_sent", updatedAt: nowISO() }).where(eq(accessRequests.id, id));
  await sendMail({
    to: request.email,
    subject: `Invoice Kullo untuk ${request.companyName}`,
    body: [
      `Halo ${request.contactName},`,
      "",
      `Terima kasih atas minat Anda pada Kullo untuk ${request.companyName}.`,
      `Paket yang dipilih: ${PLANS[request.plan] ?? request.plan}.`,
      "Admin akan mengirim invoice melalui email/WhatsApp. Setelah pembayaran, unggah bukti melalui tautan status yang Anda terima.",
      "",
      `${appUrl()}/akses/status/${request.token}`,
    ].join("\n"),
    kind: "invoice",
    requestId: request.id,
  });
  revalidatePath("/app/admin/akses");
}

export async function approveAccessAction(formData: FormData) {
  const ctx = await requireApp();
  if (!isPlatformAdmin(ctx.user.email)) throw new Error("Tidak berwenang.");
  const id = text(formData, "id");
  const request = (await db.select().from(accessRequests).where(eq(accessRequests.id, id)))[0];
  if (!request || request.status === "approved") return;

  const result = await db.transaction(async (tx) =>
    provisionWorkspace(tx, {
      orgName: request.companyName,
      name: request.contactName,
      email: request.email,
      passwordHash: request.passwordHash ?? hashPassword(crypto.randomBytes(18).toString("base64url")),
      plan: request.plan,
    }),
  );

  await db
    .update(accessRequests)
    .set({ status: "approved", userId: result.userId, orgId: result.orgId, updatedAt: nowISO() })
    .where(eq(accessRequests.id, id));

  await sendMail({
    to: request.email,
    subject: `Akses Kullo untuk ${request.companyName} sudah aktif`,
    body: [
      `Halo ${request.contactName},`,
      "",
      `Akses Kullo untuk ${request.companyName} sudah aktif.`,
      `Masuk otomatis melalui tautan ini: ${appUrl()}/akses/klaim/${request.token}`,
      "",
      "Tautan ini bersifat rahasia. Jangan teruskan ke orang lain.",
    ].join("\n"),
    kind: "access-approved",
    requestId: request.id,
  });
  revalidatePath("/app/admin/akses");
}

export async function rejectAccessAction(formData: FormData) {
  const ctx = await requireApp();
  if (!isPlatformAdmin(ctx.user.email)) throw new Error("Tidak berwenang.");
  const id = text(formData, "id");
  const note = text(formData, "note") || "Permintaan tidak dapat diproses.";
  const request = (await db.select().from(accessRequests).where(eq(accessRequests.id, id)))[0];
  if (!request) return;
  await db.update(accessRequests).set({ status: "rejected", note, updatedAt: nowISO() }).where(eq(accessRequests.id, id));
  await sendMail({
    to: request.email,
    subject: `Permintaan Kullo untuk ${request.companyName}`,
    body: `Halo ${request.contactName},\n\n${note}\n\nAnda dapat menghubungi hi.digia@gmail.com untuk pertanyaan.`,
    kind: "access-rejected",
    requestId: request.id,
  });
  revalidatePath("/app/admin/akses");
}

export async function getAccessRequests() {
  return db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt));
}

export async function getMailOutbox() {
  return db.select().from(mailOutbox).orderBy(desc(mailOutbox.createdAt)).limit(15);
}
