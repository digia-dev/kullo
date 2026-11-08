"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  X,
} from "lucide-react";
import { KulloLogo } from "./KulloMark";
import { MENU_COLUMNS, PRIMARY_NAV } from "@/content/site";
import { MODULES } from "@/content/modules";
import { GUIDES } from "@/content/guides";
import { cn } from "@/lib/utils";

type IndexItem = { label: string; href: string; group: string };

const SITE_INDEX: IndexItem[] = [
  { label: "Beranda", href: "/", group: "Halaman" },
  { label: "Produk", href: "/produk", group: "Halaman" },
  { label: "Solusi per peran", href: "/solusi", group: "Halaman" },
  { label: "Paket & harga", href: "/harga", group: "Halaman" },
  { label: "Sumber daya", href: "/sumber-daya", group: "Halaman" },
  { label: "Dukungan", href: "/dukungan", group: "Halaman" },
  { label: "Tentang Kullo", href: "/tentang", group: "Halaman" },
  ...MODULES.map((module) => ({ label: `Modul ${module.name}`, href: `/produk/${module.slug}`, group: "Modul" })),
  ...GUIDES.map((guide) => ({ label: guide.title, href: `/sumber-daya/${guide.slug}`, group: "Panduan" })),
  { label: "Masuk ke Kullo", href: "/masuk", group: "Akun" },
  { label: "Buat akun", href: "/daftar", group: "Akun" },
];

function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const normalized = query.trim().toLowerCase();
  const results = (normalized
    ? SITE_INDEX.filter(
        (item) => item.label.toLowerCase().includes(normalized) || item.href.includes(normalized),
      )
    : SITE_INDEX.slice(0, 8)
  ).slice(0, 9);

  return (
    <div
      className="palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Cari di Kullo">
        <input
          ref={inputRef}
          autoFocus
          className="palette-input"
          placeholder="Cari modul, halaman, atau panduan…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => Math.min(value + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            } else if (event.key === "Enter" && results[active]) {
              window.location.href = results[active].href;
            }
          }}
          aria-label="Cari"
        />
        <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
          {results.length === 0 ? (
            <p className="help" style={{ padding: 16, margin: 0 }}>
              Tidak ada hasil untuk “{query}”. Coba kata lain seperti “tugas”, “persetujuan”, atau “harga”.
            </p>
          ) : (
            results.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="palette-item"
                data-active={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={onClose}
              >
                <span
                  className="badge"
                  style={{ minWidth: 74, justifyContent: "center", textTransform: "capitalize" }}
                >
                  {item.group}
                </span>
                <span>{item.label}</span>
                <ChevronRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
              </Link>
            ))
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "9px 14px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span className="kbd">↑</span>
          <span className="kbd">↓</span>
          <span className="help">navigasi</span>
          <span className="kbd">Enter</span>
          <span className="help">buka</span>
          <span className="kbd">Esc</span>
          <span className="help">tutup</span>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const menuOpen = menuPath === pathname;
  const drawerOpen = drawerPath === pathname;

  useEffect(() => {
    document.body.style.overflow = drawerOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setMenuPath(null);
        setDrawerPath(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="masthead">
        <div className="shell masthead-inner">
          <button
            type="button"
            className="btn-icon nav-mobile"
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setDrawerPath(drawerOpen ? null : pathname)}
            style={{ marginRight: 2 }}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            type="button"
            className="btn-icon nav-mobile"
            aria-label="Cari"
            onClick={() => setSearchOpen(true)}
            style={{ marginRight: 6 }}
          >
            <Search size={19} />
          </button>

          <KulloLogo />

          <nav className="market-nav nav-desktop" aria-label="Navigasi utama">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("market-link", pathname === item.href && "market-link-active")}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="utility">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="utility-btn nav-desktop"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuPath(menuOpen ? null : pathname)}
              >
                Semua Kullo <ChevronDown size={14} aria-hidden />
              </button>
            </div>
            <button
              type="button"
              className="utility-btn nav-desktop"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari"
            >
              Cari <Search size={17} aria-hidden />
            </button>
            <Link href="/daftar" className="btn btn-primary btn-sm nav-desktop" style={{ marginLeft: 6 }}>
              Coba gratis
            </Link>
            <Link href="/masuk" className="utility-btn" aria-label="Masuk ke akun">
              <span className="avatar sm" aria-hidden>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>
              </span>
              <span className="nav-desktop-label">Masuk</span>
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "100%",
              background: "var(--bg)",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              boxShadow: "var(--shadow-hover)",
            }}
          >
            <div
              className="shell"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) auto",
                gap: 32,
                padding: "28px 0 32px",
              }}
            >
              {MENU_COLUMNS.map((column) => (
                <div key={column.title}>
                  <p className="eyebrow" style={{ marginBottom: 10, color: "var(--text-muted)" }}>
                    {column.title}
                  </p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="market-link" onClick={() => setMenuPath(null)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div
                style={{
                  maxWidth: 300,
                  background: "var(--accent-soft)",
                  border: "1px solid color-mix(in srgb, var(--accent) 18%, var(--border))",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <strong style={{ fontSize: 15 }}>Semua dalam satu portal</strong>
                <p className="help" style={{ fontSize: 13 }}>
                  Dua belas modul berbagi data yang sama: tugas, proyek, orang, dokumen, dan persetujuan.
                </p>
                <Link href="/sumber-daya/panduan-5-menit" className="textlink" onClick={() => setMenuPath(null)}>
                  Panduan 5 menit <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {drawerOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            inset: "54px 0 0 0",
            background: "var(--bg)",
            zIndex: 55,
            overflowY: "auto",
            borderTop: "1px solid var(--border)",
          }}
          role="navigation"
          aria-label="Menu seluler"
        >
          <div style={{ paddingBottom: 8 }}>
            {PRIMARY_NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="market-link"
                style={{
                  display: "flex",
                  minHeight: 44,
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: 0,
                  borderBottom: "1px solid var(--border)",
                  width: "100%",
                  outlineOffset: index === 0 && drawerOpen ? "-2px" : undefined,
                }}
                onClick={() => setDrawerPath(null)}
              >
                {item.label}
              </Link>
            ))}
            {MENU_COLUMNS.map((column) => {
              const isOpen = expanded === column.title;
              return (
                <div key={column.title} style={{ borderBottom: "1px solid var(--border)" }}>
                  <button
                    type="button"
                    className="market-link"
                    style={{
                      display: "flex",
                      width: "100%",
                      minHeight: 44,
                      justifyContent: "space-between",
                      padding: "10px 20px",
                      borderRadius: 0,
                      border: 0,
                      background: "none",
                      textAlign: "left",
                    }}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : column.title)}
                  >
                    {column.title}
                    <ChevronDown
                      size={16}
                      style={{ transition: "transform 160ms var(--ease)", transform: isOpen ? "rotate(180deg)" : "none" }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 20px 12px", display: "grid", gap: 6 }}>
                      {column.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          style={{ fontSize: 14, color: "var(--accent)", fontWeight: 550 }}
                          onClick={() => setDrawerPath(null)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ padding: 20, display: "grid", gap: 10 }}>
              <Link href="/daftar" className="btn btn-primary" onClick={() => setDrawerPath(null)}>
                Buat akun gratis
              </Link>
              <Link href="/masuk" className="btn btn-outline" onClick={() => setDrawerPath(null)}>
                Masuk
              </Link>
            </div>
          </div>
          <div
            aria-hidden
            style={{
              height: 6,
              background:
                "linear-gradient(90deg,#365fd1,#7a3d9e,#b0345b,#18794e,#f5a524)",
              opacity: 0.85,
            }}
          />
        </div>
      )}

      <SiteSearch key={searchOpen ? "open" : "closed"} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
