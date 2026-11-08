import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileText, Plus, Upload } from "lucide-react";
import { requireApp } from "@/lib/auth";
import { getProjectBundle } from "@/lib/data";
import { EmptyState } from "@/components/app/ui";
import { formatBytes, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "File proyek" };

export default async function ProjectFilesPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireApp();
  const { id } = await params;
  const bundle = getProjectBundle(ctx.org.id, id);
  if (!bundle) notFound();
  const docs = bundle.documents;

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>File proyek</h2>
        <span className="badge">{docs.length}</span>
        <Link href={`/app/documents?new=1&project=${bundle.project.id}`} className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}>
          <Upload size={14} /> Tambah dokumen
        </Link>
      </div>
      {docs.length === 0 ? (
        <EmptyState
          title="Belum ada file terkait proyek"
          copy="Dokumen yang diunggah ke proyek ini akan muncul di sini, bersama versi dan pemiliknya."
          action={{ label: "Buka dokumen", href: `/app/documents?new=1&project=${bundle.project.id}` }}
        />
      ) : (
        <div className="panel">
          {docs.map((doc) => (
            <div key={doc.id} className="doc-row">
              <span className="doc-icon"><FileText size={15} /></span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Link href={`/app/documents?doc=${doc.id}`} style={{ fontSize: 13, fontWeight: 550 }}>{doc.name}</Link>
                <p style={{ margin: 0, fontSize: 10.5, color: "var(--text-muted)" }}>
                  {doc.kind.toUpperCase()} · v{doc.version} · {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                </p>
              </div>
              <a href={`/api/documents/${doc.id}/file`} className="icon-btn" aria-label={`Unduh ${doc.name}`} title="Unduh">
                <Download size={15} />
              </a>
            </div>
          ))}
        </div>
      )}
      <p className="help" style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
        <Plus size={13} /> File disimpan lewat adapter lokal pada versi ini. Metadata dan versi tetap tercatat.
      </p>
    </>
  );
}
