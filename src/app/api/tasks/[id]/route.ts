import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/auth";
import { getTaskDetail } from "@/lib/data";
import { can } from "@/lib/rbac";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAppContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const editable = can(ctx, "task.edit");
  const detail = await getTaskDetail(ctx.org.id, id, editable);
  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...detail, currentUserId: ctx.user.id });
}
