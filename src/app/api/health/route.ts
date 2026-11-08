import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "kullo", at: new Date().toISOString() });
}
