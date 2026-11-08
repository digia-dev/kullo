import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, Users } from "lucide-react";
import { db } from "@/db/client";
import { memberships, organizations, users } from "@/db/schema";
import { hashInviteToken } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import { InviteAcceptForm } from "@/components/site/InviteAcceptForm";
import { nowISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Bergabung ke organisasi" };

type SearchParams = Promise<{ token?: string }>;

export default async function GabungPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  const membership = token
    ? db.select().from(memberships).where(eq(memberships.inviteTokenHash, hashInviteToken(token))).get()
    : null;
  const valid = Boolean(membership && membership.status === "invited" && (!membership.inviteExpiresAt || membership.inviteExpiresAt >= nowISO()));
  const org = membership ? db.select().from(organizations).where(eq(organizations.id, membership.orgId)).get() : null;
  const user = membership ? db.select().from(users).where(eq(users.id, membership.userId)).get() : null;

  return (
    <section className="shell" style={{ padding: "52px 0 76px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 16 }}>
        <Link href="/" className="textlink" style={{ fontSize: 13 }}><ArrowLeft size={14} /> Kembali ke beranda</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}><Users size={19} /></span>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Undangan</p>
            <h1 className="market-h1" style={{ fontSize: 30, lineHeight: "36px" }}>Bergabung ke workspace</h1>
          </div>
        </div>
        {valid && org && user && token ? (
          <div className="panel" style={{ padding: 24 }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 650 }}>{org.name}</p>
            <p className="help" style={{ margin: "0 0 16px" }}>Peran yang diberikan: {ROLE_LABELS[membership?.role ?? "staff"] ?? membership?.role}</p>
            <InviteAcceptForm token={token} isNew={user.title === "Anggota baru"} email={user.email} />
          </div>
        ) : (
          <div className="panel" style={{ padding: 24, display: "grid", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Undangan tidak valid</p>
            <p className="help" style={{ margin: 0 }}>Tautan ini sudah digunakan, kedaluwarsa, atau tidak dikenal. Minta administrator organisasi membuat tautan baru.</p>
            <Link href="/masuk" className="btn btn-outline btn-sm" style={{ justifySelf: "start", marginTop: 6 }}>Masuk ke akun</Link>
          </div>
        )}
      </div>
    </section>
  );
}
