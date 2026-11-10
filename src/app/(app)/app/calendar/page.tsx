import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getEvents, getProjectOptions } from "@/lib/data";
import { EventCalendar } from "@/components/app/EventCalendar";
import { StatCard } from "@/components/app/ui";

export const metadata: Metadata = { title: "Kalender" };

export default async function CalendarPage() {
  const ctx = await requireApp();
  const events = await getEvents(ctx.org.id);
  const projects = await getProjectOptions(ctx.org.id);

  const meetings = events.filter((event) => event.kind === "meeting").length;
  const deadlines = events.filter((event) => event.kind === "deadline").length;
  const now = new Date().getTime();
  const weekAhead = events.filter((event) => {
    const time = new Date(event.startsAt).getTime();
    return time >= now && time <= now + 7 * 86400000;
  }).length;

  return (
    <>
      <h1 className="sr-only">Kalender</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Minggu ini" value={weekAhead} hint="Agenda terjadwal" href="#cal" />
        <StatCard label="Rapat" value={meetings} hint="Seluruh bulan" />
        <StatCard label="Tenggat" value={deadlines} hint="Terikat proyek" href="/app/tasks" />
        <StatCard label="Jam kerja" value={`${ctx.org.workStart}–${ctx.org.workEnd}`} hint={ctx.org.timezone} />
      </div>

      <div id="cal">
        <EventCalendar
          events={events}
          projects={projects.map((project) => ({ id: project.id, name: project.name, code: project.code }))}
          canDeleteAny={can(ctx, "org.manage")}
        />
      </div>
    </>
  );
}
