import type { Metadata } from "next";
import { requireApp } from "@/lib/auth";
import { getApprovalInbox } from "@/lib/data";
import { can } from "@/lib/rbac";
import { ApprovalsClient } from "@/components/app/ApprovalsClient";

export const metadata: Metadata = { title: "Persetujuan" };

export default async function ApprovalsPage() {
  const ctx = await requireApp();
  const { pending, history } = getApprovalInbox(ctx);
  const map = (request: (typeof pending)[number]) => ({
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
    steps: request.steps.map((step) => ({ id: step.id, position: step.position, approverId: step.approverId, approverName: step.approverName, status: step.status, note: step.note, decidedAt: step.decidedAt })),
  });

  return (
    <>
      <h1 className="sr-only">Persetujuan</h1>
      <ApprovalsClient pending={pending.map(map)} history={history.map(map)} currentUserId={ctx.user.id} canDecide={can(ctx, "approval.decide")} />
    </>
  );
}
