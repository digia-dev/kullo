import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { getObject } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const user = (await db.select().from(users).where(eq(users.id, id)))[0];
  if (!user) return new NextResponse("Not found", { status: 404 });

  if (user.avatarKey) {
    try {
      const file = await getObject(user.avatarKey);
      const extension = user.avatarKey.split(".").pop()?.toLowerCase();
      const type = extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
      return new NextResponse(new Uint8Array(file), {
        headers: { "content-type": type, "cache-control": "private, no-store" },
      });
    } catch {
      /* fall through to initials */
    }
  }

  const requested = new URL(request.url).searchParams.get("color") ?? "";
  const color = /^#[0-9a-fA-F]{6}$/.test(requested) ? requested : user.avatarColor;
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="${color}"/><text x="48" y="52" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="600" fill="#ffffff">${initials}</text></svg>`;
  return new NextResponse(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "private, no-store" },
  });
}
