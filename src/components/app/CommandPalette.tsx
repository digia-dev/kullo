"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CornerDownLeft, Loader2, Search } from "lucide-react";

type Result = { id: string; type: string; title: string; subtitle: string; href: string };

const QUICK: Result[] = [
  { id: "q-dash", type: "Halaman", title: "Dashboard", subtitle: "Ringkasan hari ini", href: "/app/dashboard" },
  { id: "q-work", type: "Halaman", title: "My Work", subtitle: "Tugas yang ditugaskan kepada Anda", href: "/app/my-work" },
  { id: "q-proj", type: "Halaman", title: "Proyek", subtitle: "Portofolio dan papan proyek", href: "/app/projects" },
  { id: "q-appr", type: "Halaman", title: "Persetujuan", subtitle: "Kotak masuk keputusan", href: "/app/approvals" },
  { id: "q-rep", type: "Halaman", title: "Laporan", subtitle: "Agregat tugas dan tim", href: "/app/reports" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setActive(0);
    setError("");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("search failed");
        const data = (await response.json()) as { results: Result[] };
        setResults(data.results ?? []);
        setActive(0);
        setError("");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Pencarian gagal. Coba lagi.");
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  if (!open) return null;
  const list = query.trim() ? results : QUICK;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className="palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Pencarian global">
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <Search size={17} style={{ marginLeft: 16, color: "var(--text-muted)", flex: "none" }} aria-hidden />
          <input
            ref={inputRef}
            className="palette-input"
            style={{ borderBottom: 0 }}
            placeholder="Cari tugas, proyek, orang, atau dokumen…"
            value={query}
            aria-label="Cari di Kullo"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, list.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter" && list[active]) {
                event.preventDefault();
                go(list[active].href);
              } else if (event.key === "Escape") {
                onClose();
              }
            }}
          />
          {loading && <Loader2 size={16} className="animate-spin" style={{ marginRight: 14, color: "var(--text-muted)" }} />}
        </div>

        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {!query.trim() && (
            <p className="help" style={{ padding: "4px 10px 8px", margin: 0 }}>
              Pintasan cepat. Ketik untuk mencari di seluruh workspace.
            </p>
          )}
          {list.length === 0 && query.trim() && !loading && (
            <p className="help" style={{ padding: 16, margin: 0 }}>
              Tidak ada hasil untuk “{query}”. Coba judul tugas, kode proyek, nama orang, atau nama dokumen.
            </p>
          )}
          {list.map((item, index) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              className="palette-item"
              data-active={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(item.href)}
              style={{ width: "100%", border: 0, background: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span className="badge" style={{ minWidth: 66, justifyContent: "center" }}>{item.type}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.title}
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.subtitle}
                </span>
              </span>
              <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
            </button>
          ))}
          {error && <p className="error-text" style={{ padding: "0 10px" }}>{error}</p>}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 14px", borderTop: "1px solid var(--border)" }}>
          <span className="kbd">↑</span><span className="kbd">↓</span><span className="help">navigasi</span>
          <CornerDownLeft size={12} style={{ color: "var(--text-muted)", marginLeft: 6 }} />
          <span className="help">buka</span>
          <span className="kbd" style={{ marginLeft: "auto" }}>Esc</span><span className="help">tutup</span>
        </div>
      </div>
    </div>
  );
}
