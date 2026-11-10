import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getProjectBundle } from "@/lib/data";
import { PageHeader } from "@/components/app/ui";
import { ProjectTabs } from "@/components/app/ProjectTabs";
import { projectStatus } from "@/lib/utils";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = await getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  const { project } = bundle;
  const status = projectStatus(project.status);

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <Link href="/app/projects" className="textlink" style={{ fontSize: 12 }}>
          <ArrowLeft size={13} /> Semua proyek
        </Link>
        <span className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{project.code}</span>
        <span className={`badge ${status.tone}`}>{status.label}</span>
        {project.archivedAt && <span className="badge">Arsip</span>}
      </div>

      <PageHeader
        title={project.name}
        subtitle={project.description ?? "Belum ada deskripsi proyek."}
      />

      <ProjectTabs projectId={project.id} />
      <div className="project-outlet">{children}</div>
    </>
  );
}
