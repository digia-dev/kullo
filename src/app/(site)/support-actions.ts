"use server";

import { z } from "zod";
import { db } from "@/db/client";
import { supportMessages } from "@/db/schema";
import { newId } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Alamat email tidak valid."),
  topic: z.string().trim().min(1),
  message: z.string().trim().min(10, "Tuliskan pesan minimal 10 karakter."),
});

export type ContactState = { ok: boolean; message: string };

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic") ?? "umum",
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda." };
  }

  await db.insert(supportMessages)
    .values({
      id: newId("sup"),
      name: parsed.data.name,
      email: parsed.data.email,
      topic: parsed.data.topic,
      message: parsed.data.message,
    });

  return {
    ok: true,
    message: "Pesan Anda sudah masuk antrean dukungan. Kami membalas lewat email yang Anda cantumkan.",
  };
}
