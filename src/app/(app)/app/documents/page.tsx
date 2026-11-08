import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getDocuments, getProjectOptions } from "@/lib/data";
import { formatBytes, formatNumber } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/app/ui";
import { DocumentsClient } from "@/components/app/DocumentsClient";

export const metadata: Metadata = { title: "Dokumen" };

type SearchParams = Promise<{ new?: string; project?: string; doc?: string }>;

export default async function DocumentsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const params = await searchParams;
  const { folders, documents } = getDocuments(ctx.org.id);
  const projects = getProjectOptions(ctx.org.id);
  const canManage = can(ctx, "document.manage");
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const versions = documents.reduce((sum, doc) => sum + doc.versions.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Pengetahuan"
        title="Dokumen"
        subtitle={`${documents.length} berkas · ${folders.length} folder · ${formatBytes(totalSize)} terpakai · ${versions} riwayat versi`}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatCard label="Berkas" value={formatNumber(documents.length)} hint="Seluruh organisasi" />
        <StatCard label="Terpakai" value={formatBytes(totalSize)} hint="Kuota paket saat ini" />
        <StatCard label="Riwayat versi" value={formatNumber(versions)} hint="Catatan perubahan" />
        <StatCard label="Folder" value={formatNumber(folders.length)} hint="Pengelompokan berkas" />
      </div>

      <DocumentsClient
        documents={documents}
        folders={folders}
        projects={projects.map((project) => ({ id: project.id, name: project.name, code: project.code }))}
        canManage={canManage}
        openUpload={params.new === "upload"}
        initialProject={params.project}
        initialDoc={params.doc}
      />
    </>
  );
}
