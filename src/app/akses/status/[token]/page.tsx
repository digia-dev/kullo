import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { accessRequests } from "@/db/schema";
import { PaymentProofForm } from "@/components/site/PaymentProofForm";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata: Metadata = { title: "Status permintaan akses", robots: { index: false } };

const LABELS: Record<string, string> = {
  pending: "Menunggu verifikasi admin",
  invoice_sent: "Invoice dikirim — menunggu pembayaran",
  proof_received: "Bukti pembayaran diterima — menunggu verifikasi",
  approved: "Akses disetujui",
  rejected: "Permintaan ditolak",
};

export default async function StatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = (await db.select().from(accessRequests).where(eq(accessRequests.token, token)))[0];

  if (!row) {
    return (
      <AuthShell
        formTitle="Tautan tidak ditemukan"
        formDescription="Periksa kembali tautan yang Anda terima dari admin Kullo."
        leftIllustration="/illustrations/auth-secure-login-hero.svg"
        rightIllustration="/illustrations/auth-login-hero.svg"
      >
        <Link href="/dukungan" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
          Hubungi dukungan
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      formTitle={`Permintaan untuk ${row.companyName}`}
      formDescription={`Status: ${LABELS[row.status] ?? row.status}. Email: ${row.email}.`}
      leftIllustration="/illustrations/auth-authentication-hero.svg"
      rightIllustration="/illustrations/auth-secure-login-hero.svg"
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div className="panel" style={{ padding: 14 }}>
          <p className="help" style={{ margin: 0 }}>
            Paket: <strong>{row.plan === "free" ? "Gratis" : row.plan}</strong>
            <br />
            Diminta: {new Date(row.createdAt).toLocaleString("id-ID")}
          </p>
        </div>

        {row.status === "approved" ? (
          <Link href={`/akses/klaim/${row.token}`} className="btn btn-primary" style={{ justifyContent: "center" }}>
            Masuk ke aplikasi
          </Link>
        ) : null}

        {["pending", "invoice_sent"].includes(row.status) ? <PaymentProofForm token={row.token} /> : null}

        {row.status === "proof_received" ? (
          <p className="help" style={{ margin: 0 }}>
            Bukti pembayaran sudah diterima. Admin akan memverifikasi dan mengirim tautan masuk ke email Anda.
          </p>
        ) : null}

        {row.status === "rejected" ? (
          <p className="error-text" role="alert" style={{ margin: 0 }}>
            {row.note ?? "Permintaan tidak dapat diproses."}
          </p>
        ) : null}

        <p className="help" style={{ margin: 0, textAlign: "center" }}>
          Butuh bantuan? <Link href="/dukungan" className="textlink">Hubungi dukungan</Link>
        </p>
      </div>
    </AuthShell>
  );
}
