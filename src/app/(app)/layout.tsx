import { requireApp } from "@/lib/auth";
import { getMyWorkCount, getNotifications, getPendingApprovalCount, getUnreadNotificationCount } from "@/lib/data";
import { AppShell } from "@/components/app/AppShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireApp();
  const notifications = getNotifications(ctx.org.id, ctx.user.id, 10);
  const unread = getUnreadNotificationCount(ctx.org.id, ctx.user.id);
  const myWork = getMyWorkCount(ctx.org.id, ctx.user.id);
  const approvals = getPendingApprovalCount(ctx.org.id, ctx.user.id);

  return (
    <AppShell
      user={{ id: ctx.user.id, name: ctx.user.name, email: ctx.user.email, title: ctx.user.title, avatarColor: ctx.user.avatarColor }}
      org={{ id: ctx.org.id, name: ctx.org.name, slug: ctx.org.slug, plan: ctx.org.plan }}
      membership={{ role: ctx.membership.role }}
      notifications={notifications.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        body: item.body,
        href: item.href,
        readAt: item.readAt,
        createdAt: item.createdAt,
      }))}
      counts={{ unread, myWork, approvals }}
    >
      {children}
    </AppShell>
  );
}
