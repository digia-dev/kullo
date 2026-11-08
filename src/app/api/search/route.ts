import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/auth";
import { getSearchResults } from "@/lib/data";

export async function GET(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ results: getSearchResults(ctx, q) });
}
