import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/auth";
import { getDepartments, getPeople, getProjectOptions } from "@/lib/data";

export async function GET() {
  const ctx = await getAppContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    projects: getProjectOptions(ctx.org.id),
    people: getPeople(ctx.org.id).map((person) => ({ id: person.id, name: person.name, role: person.role })),
    departments: getDepartments(ctx.org.id).map((dept) => ({ id: dept.id, name: dept.name })),
  });
}
