import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { mailOutbox } from "@/db/schema";
import { newId, nowISO } from "@/lib/utils";

const FROM = process.env.KULLO_MAIL_FROM ?? "Kullo <noreply@kullo.app>";
const ADMIN_EMAILS = (process.env.KULLO_ADMIN_EMAILS ?? "hi.digia@gmail.com")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const NOTIFY_EMAILS = (process.env.KULLO_NOTIFY_EMAILS ?? "hi.digia@gmail.com")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function isPlatformAdmin(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function adminEmails() {
  return NOTIFY_EMAILS;
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.SITE_URL ?? "https://kullo.app").replace(/\/$/, "");
}

type MailInput = {
  to: string;
  subject: string;
  body: string;
  kind?: string;
  requestId?: string | null;
};

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendViaSmtp(input: MailInput) {
  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transport.sendMail({
    from: FROM,
    to: input.to,
    subject: input.subject,
    text: input.body,
  });
}

async function sendViaResend(input: MailInput) {
  const key = process.env.RESEND_API_KEY as string;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [input.to],
      subject: input.subject,
      text: input.body,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}`);
}

/**
 * Sends transactional mail through SMTP (preferred) or Resend. Every message is
 * written to mail_outbox first, so the admin inbox can show the content and the
 * login link even when no provider is configured yet.
 */
export async function sendMail(input: MailInput) {
  const id = newId("mail");
  await db.insert(mailOutbox).values({
    id,
    to: input.to,
    subject: input.subject,
    body: input.body,
    kind: input.kind ?? "transactional",
    requestId: input.requestId ?? null,
    createdAt: nowISO(),
  });

  try {
    if (smtpConfigured()) await sendViaSmtp(input);
    else if (process.env.RESEND_API_KEY) await sendViaResend(input);
    else return { sent: false, id, reason: "not-configured" as const };

    await db.update(mailOutbox).set({ sentAt: nowISO() }).where(eq(mailOutbox.id, id));
    return { sent: true, id, reason: "sent" as const };
  } catch (error) {
    return {
      sent: false,
      id,
      reason: "error" as const,
      error: error instanceof Error ? error.message : "send failed",
    };
  }
}
