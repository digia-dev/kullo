import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * File storage adapter.
 *
 * Production uses Supabase Storage (private bucket, service-role key kept on
 * the server). Local development and the Playwright suite fall back to
 * `data/uploads` when Supabase credentials are absent, so the app still runs
 * without cloud credentials.
 */

const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "kullo-files";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient | null {
  if (!supabaseUrl || !serviceKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function usingSupabaseStorage() {
  return Boolean(supabaseUrl && serviceKey);
}

export async function putObject(key: string, data: Buffer, contentType = "application/octet-stream") {
  const sb = supabase();
  if (!sb) {
    const absolute = path.join(process.cwd(), "data", "uploads", key);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, data);
    return;
  }
  const { error } = await sb.storage.from(bucket).upload(key, data, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function getObject(key: string): Promise<Buffer> {
  const sb = supabase();
  if (!sb) {
    return fs.readFile(path.join(process.cwd(), "data", "uploads", key));
  }
  const { data, error } = await sb.storage.from(bucket).download(key);
  if (error || !data) throw new Error(`Storage download failed: ${error?.message ?? "not found"}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function deleteObject(key: string) {
  const sb = supabase();
  if (!sb) {
    await fs.rm(path.join(process.cwd(), "data", "uploads", key), { force: true });
    return;
  }
  const { error } = await sb.storage.from(bucket).remove([key]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

export async function copyObject(fromKey: string, toKey: string) {
  const data = await getObject(fromKey);
  await putObject(toKey, data);
}

/** Short-lived signed URL for private objects (server-generated). */
export async function signedUrl(key: string, expiresIn = 60 * 10): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(key, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export function contentTypeFor(name: string): string {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    zip: "application/zip",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return map[ext] ?? "application/octet-stream";
}
