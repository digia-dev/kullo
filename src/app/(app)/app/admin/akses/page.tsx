import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApp } from "@/lib/auth";
import { isPlatformAdmin, appUrl } from "@/lib/mail";
import {
  approveAccessAction,
  getAccessRequests,
  getMailOutbox,
  getPlatformAudit,
  markInvoiceSentAction,
  rejectAccessAction,
} from "@/lib/access-actions";

export const metadata: Metadata = { title: "Admin akses", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  invoice_sent: "Invoice dikirim",
  proof_received: "Bukti diterima",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default async function AdminAccessPage() {
  const ctx = await requireApp();
  if (!isPlatformAdmin(ctx.user.email)) notFound();

  const [requests, outbox, audit] = await Promise.all([getAccessRequests(), getMailOutbox(), getPlatformAudit()]);

  return (
    <>
      <h1>Permintaan akses</h1>
      <p className="help" style={{ marginTop: 4 }}>
        Demo dan pendaftaran berbayar. Setujui untuk membuat ruang kerja baru dan mengirim tautan masuk ke email pemohon.
      </p>

      {!process.env.RESEND_API_KEY && (
        <div className="panel" style={{ padding: 12, marginBottom: 14 }}>
          <strong>Email belum dikonfigurasi.</strong>{" "}
          <span className="help">
            Semua notifikasi tersimpan di outbox di bawah. Setel <code>RESEND_API_KEY</code> untuk pengiriman otomatis.
          </span>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {requests.length === 0 ? <p className="help">Belum ada permintaan.</p> : null}
        {requests.map((request) => {
          const link = `${appUrl()}/akses/klaim/${request.token}`;
          return (
            <article key={request.id} className="panel" style={{ padding: 14, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <strong>{request.companyName}</strong>
                <span className="badge">{request.kind === "demo" ? "Demo" : "Pendaftaran"}</span>
                <span className={`badge ${request.status === "approved" ? "badge-success" : request.status === "rejected" ? "badge-danger" : ""}`}>
                  {STATUS_LABEL[request.status] ?? request.status}
                </span>
                <span className="help" style={{ marginLeft: "auto" }}>
                  {new Date(request.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="help" style={{ margin: 0 }}>
                {request.contactName} · {request.email}
                {request.phone ? ` · ${request.phone}` : ""} · paket {request.plan}
              </p>
              {request.status === "approved" ? (
                <code style={{ fontSize: 12, overflowWrap: "anywhere" }}>{link}</code>
              ) : null}
              {request.paymentProofKey ? (
                <a className="textlink" href={`/api/access-proof/${request.id}`} target="_blank" rel="noreferrer">
                  Lihat bukti pembayaran
                </a>
              ) : null}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {request.kind === "signup" && request.status === "pending" ? (
                  <form action={markInvoiceSentAction}>
                    <input type="hidden" name="id" value={request.id} />
                    <button className="btn btn-secondary btn-sm" type="submit">Tandai invoice dikirim</button>
                  </form>
                ) : null}
                {request.status !== "approved" && request.status !== "rejected" ? (
                  <form action={approveAccessAction}>
                    <input type="hidden" name="id" value={request.id} />
                    <button className="btn btn-primary btn-sm" type="submit">Setujui &amp; buat akses</button>
                  </form>
                ) : null}
                {request.status !== "rejected" ? (
                  <form action={rejectAccessAction}>
                    <input type="hidden" name="id" value={request.id} />
                    <input className="input" name="note" placeholder="Alasan penolakan (opsional)" style={{ minWidth: 220 }} />
                    <button className="btn btn-secondary btn-sm" type="submit">Tolak</button>
                  </form>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <h2 style={{ marginTop: 24 }}>Audit admin</h2>
      <div className="panel" style={{ padding: 12, display: "grid", gap: 6 }}>
        {audit.length === 0 ? <p className="help" style={{ margin: 0 }}>Belum ada aksi admin.</p> : null}
        {audit.map((row) => (
          <p key={row.id} className="help" style={{ margin: 0 }}>
            {new Date(row.createdAt).toLocaleString("id-ID")} · {row.actorEmail} · {row.action} · {row.requestId ?? "-"}{row.meta ? ` · ${row.meta}` : ""}
          </p>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>Outbox email</h2>
      <p className="help">
        {process.env.RESEND_API_KEY ? "Resend aktif — pesan terkirim ditandai." : "Belum ada provider email; isi pesan di bawah bisa disalin manual."}
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {outbox.map((mail) => (
          <details key={mail.id} className="panel" style={{ padding: 12 }}>
            <summary>
              <strong>{mail.subject}</strong> — {mail.to} {mail.sentAt ? "(terkirim)" : "(belum terkirim)"}
            </summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 8 }}>{mail.body}</pre>
          </details>
        ))}
      </div>
    </>
  );
}
