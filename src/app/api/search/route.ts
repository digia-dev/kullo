import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/auth";
import { getSearchResults } from "@/lib/data";
import { rateLimit, retryMinutes } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = rateLimit(`search:${ctx.user.id}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak pencarian. Coba lagi dalam ${retryMinutes(limit.retryAfterMs)} menit.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ results: await getSearchResults(ctx, q) });
}
