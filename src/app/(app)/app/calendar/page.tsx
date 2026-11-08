import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getEvents, getProjectOptions } from "@/lib/data";
import { EventCalendar } from "@/components/app/EventCalendar";
import { PageHeader, StatCard } from "@/components/app/ui";

export const metadata: Metadata = { title: "Kalender" };

export default async function CalendarPage() {
  const ctx = await requireApp();
  const events = getEvents(ctx.org.id);
  const projects = getProjectOptions(ctx.org.id);

  const meetings = events.filter((event) => event.kind === "meeting").length;
  const deadlines = events.filter((event) => event.kind === "deadline").length;
  const now = new Date().getTime();
  const weekAhead = events.filter((event) => {
    const time = new Date(event.startsAt).getTime();
    return time >= now && time <= now + 7 * 86400000;
  }).length;

  return (
    <>
      <PageHeader
        eyebrow="Jadwal"
        title="Kalender"
        subtitle={`${events.length} agenda · ${meetings} rapat · ${deadlines} tenggat · ${weekAhead} dalam 7 hari ke depan`}
        actions={
          <>
            <Link href="/app/tasks?view=board" className="btn btn-outline btn-sm">Tenggat tugas</Link>
            <Link href="/app/calendar?new=event" className="btn btn-primary btn-sm"><CalendarPlus size={15} /> Agenda baru</Link>
          </>
        }
      />

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
