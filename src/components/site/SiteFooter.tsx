import Link from "next/link";
import { Globe } from "lucide-react";
import { FOOTER_COLUMNS, LEGAL_LINKS, SITE } from "@/content/site";
import { KulloLogo } from "./KulloMark";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell" style={{ padding: "44px 0 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "28px 32px",
          }}
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p style={{ fontSize: 14, fontWeight: 650, margin: "0 0 6px" }}>{column.title}</p>
              <div>
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" style={{ margin: "30px 0 18px" }} />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "14px 26px",
            paddingBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <Globe size={16} aria-hidden />
            <span>{SITE.locale}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <span
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: "linear-gradient(135deg,#365fd1,#7a3d9e)",
                display: "inline-block",
              }}
            />
            {SITE.name} · {SITE.tagline}
          </div>
          <nav aria-label="Tautan legal" style={{ display: "flex", flexWrap: "wrap", gap: 18, marginLeft: "auto" }}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link" style={{ display: "inline-block" }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--text-muted)" }}>
          <KulloLogo size={22} wordSize={15} />
          <span>© 2026 Kullo. Produk dan dokumen ini adalah milik Kullo.</span>
        </div>
      </div>
    </footer>
  );
}
