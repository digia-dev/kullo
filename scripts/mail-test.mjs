import { loadEnvFile } from "node:process";
import nodemailer from "nodemailer";

for (const file of [".env.local", ".env"]) {
  try {
    loadEnvFile(file);
  } catch {
    /* optional */
  }
}

const to = process.argv[2];
if (!to) {
  console.error("Usage: npm run mail:test -- alamat@tujuan.com");
  process.exit(1);
}

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = Number(process.env.SMTP_PORT ?? 587);

if (!host || !user || !pass) {
  console.error("SMTP_HOST, SMTP_USER, dan SMTP_PASS belum diatur di .env.local.");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  const info = await transport.sendMail({
    from: process.env.KULLO_MAIL_FROM ?? `Kullo <${user}>`,
    to,
    subject: "Uji SMTP Kullo",
    text: "Jika Anda menerima email ini, konfigurasi SMTP Kullo sudah benar.",
  });
  console.log("Terkirim:", info.messageId, "→", to);
} catch (error) {
  console.error("Gagal mengirim:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
