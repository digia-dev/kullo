import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Users } from "lucide-react";
import { db } from "@/db/client";
import { memberships, organizations, users } from "@/db/schema";
import { hashInviteToken } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import { InviteAcceptForm } from "@/components/site/InviteAcceptForm";
import { AuthShell } from "@/components/site/AuthShell";
import { nowISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Bergabung ke organisasi" };

type SearchParams = Promise<{ token?: string }>;

export default async function GabungPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  const membership = token
    ? (await db.select().from(memberships).where(eq(memberships.inviteTokenHash, hashInviteToken(token))))[0]
    : null;
  const valid = Boolean(membership && membership.status === "invited" && (!membership.inviteExpiresAt || membership.inviteExpiresAt >= nowISO()));
  const org = membership ? (await db.select().from(organizations).where(eq(organizations.id, membership.orgId)))[0] : null;
  const user = membership ? (await db.select().from(users).where(eq(users.id, membership.userId)))[0] : null;

  return (
    <AuthShell
      formTitle="Terima undangan"
      formDescription={valid && org ? `Anda diundang ke ${org.name}.` : "Tinjau detail undangan di bawah ini."}
      leftIllustration="/illustrations/auth-login-hero.svg"
      rightIllustration="/illustrations/auth-authentication-hero.svg"
    >
      {valid && org && user && token ? (
        <div className="auth-invite">
          <div className="auth-invite-org">
            <span className="auth-invite-icon">
              <Users size={18} aria-hidden />
            </span>
            <div>
              <strong>{org.name}</strong>
              <p>Peran: {ROLE_LABELS[membership?.role ?? "staff"] ?? membership?.role}</p>
            </div>
          </div>
          <InviteAcceptForm token={token} isNew={user.title === "Anggota baru"} email={user.email} />
        </div>
      ) : (
        <div className="auth-invite">
          <p className="auth-invite-empty">
            Tautan ini sudah digunakan, kedaluwarsa, atau tidak dikenal. Minta administrator organisasi membuat tautan baru.
          </p>
          <Link href="/masuk" className="btn btn-outline" style={{ width: "100%" }}>
            Masuk ke akun
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
