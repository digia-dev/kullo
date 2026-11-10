import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/auth";
import { getReports } from "@/lib/data";
import { can } from "@/lib/rbac";

export async function GET(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx, "report.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const reports = await getReports(ctx.org.id, {
    departmentId: url.searchParams.get("departmentId") || undefined,
    projectId: url.searchParams.get("projectId") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  });

  const rows: string[][] = [["Bagian", "Nama", "Total", "Selesai", "Terbuka", "Terlambat", "Menit"]];
  rows.push(["Ringkasan", "Semua tugas", String(reports.totals.total), String(reports.totals.done), String(reports.totals.pending), String(reports.totals.overdue), String(reports.totals.minutes)]);
  for (const project of reports.projects) rows.push(["Proyek", project.name, String(project.total), String(project.done), String(project.total - project.done), "", ""]);
  for (const dept of reports.departments) rows.push(["Departemen", dept.name, String(dept.total), String(dept.done), String(dept.total - dept.done), String(dept.overdue), ""]);
  for (const person of reports.people) rows.push(["Anggota", person.name, String(person.open + person.done), String(person.done), String(person.open), String(person.overdue), String(person.minutes)]);

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kullo-laporan-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
