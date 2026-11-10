"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  busyLabel = "Memproses…",
  busy = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const close = () => {
    if (!busy) onClose();
  };
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    const focusables = () =>
      node
        ? Array.from(node.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled])")).filter(
            (element) => element.offsetParent !== null,
          )
        : [];
    const timer = window.setTimeout(() => focusables()[0]?.focus(), 20);
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onTab);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onTab);
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="palette-backdrop"
      role="presentation"
      style={{ zIndex: 130 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div ref={panelRef} className="palette" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <strong style={{ fontSize: 14 }}>{title}</strong>
          <button type="button" className="icon-btn" style={{ marginLeft: "auto", width: 30, height: 30 }} aria-label="Tutup" onClick={close} disabled={busy}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 12, display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{description}</p>
          {error && <p className="error-text" style={{ margin: 0 }} role="alert">{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={close} disabled={busy}>Batal</button>
            <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={onConfirm}>
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
