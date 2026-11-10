"use server";

import { db } from "@/db/client";
import { supportMessages } from "@/db/schema";
import { newId } from "@/lib/utils";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Record<string, string>;
};

const TOPICS = ["umum", "harga", "demo", "keamanan", "karier"] as const;

export async function submitSupportMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const topic = String(formData.get("topic") ?? "umum");
  const message = String(formData.get("message") ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Isi nama Anda.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Format email belum lengkap. Contoh: nama@domain.com.";
  if (message.length < 20) errors.message = "Tuliskan minimal 20 karakter agar kami dapat membantu.";
  if (!(TOPICS as readonly string[]).includes(topic)) errors.topic = "Pilih topik yang tersedia.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Beberapa isian perlu diperbaiki.", errors };
  }

  db.insert(supportMessages)
    .values({
      id: newId("sup"),
      name,
      email,
      topic,
      message,
    })
    .run();

  return {
    status: "ok",
    message: "Terima kasih. Pesan Anda masuk ke antrean dukungan kami dan akan dibalas lewat email.",
  };
}
