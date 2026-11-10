import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getRequestTemplates, getRequests } from "@/lib/data";
import { can } from "@/lib/rbac";
import { RequestsClient } from "@/components/app/RequestsClient";

export const metadata: Metadata = { title: "Form & permintaan" };

type SearchParams = Promise<{ new?: string }>;

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await requireApp();
  const params = await searchParams;
  const templates = await getRequestTemplates(ctx.org.id);
  const requests = await getRequests(ctx.org.id);

  return (
    <>
      <h1 className="sr-only">Form &amp; permintaan</h1>
      {!can(ctx, "request.create") ? (
        <div className="empty-state">
          <strong style={{ color: "var(--text)" }}>Peran Anda belum memiliki izin mengajukan permintaan</strong>
          <p style={{ margin: "4px 0 0" }}>Hubungi administrator organisasi untuk menyesuaikan matriks izin.</p>
        </div>
      ) : (
        <RequestsClient
          templates={templates.map((template) => ({
            id: template.id,
            key: template.key,
            name: template.name,
            description: template.description,
            category: template.category,
            fields: template.fields.map((field) => ({ id: field.id, label: field.label, type: field.type, required: field.required, options: field.options })),
          }))}
          requests={requests.map((request) => ({
            id: request.id,
            title: request.title,
            amount: request.amount,
            status: request.status,
            currentStep: request.currentStep,
            createdAt: request.createdAt,
            templateName: request.templateName,
            requesterId: request.requesterId,
            requesterName: request.requesterName,
            requesterColor: request.requesterColor,
            data: request.data,
            steps: request.steps.map((step) => ({ id: step.id, position: step.position, approverName: step.approverName, status: step.status, note: step.note, decidedAt: step.decidedAt })),
          }))}
          currentUserId={ctx.user.id}
          openNew={params.new === "1"}
        />
      )}
    </>
  );
}
