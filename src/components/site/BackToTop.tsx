"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className="back-to-top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 70,
        display: visible ? "inline-flex" : "none",
        alignItems: "center",
        gap: 8,
        height: 42,
        padding: "0 18px",
        borderRadius: 999,
        background: "var(--ink)",
        color: "var(--on-accent)",
        border: 0,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      Kembali ke atas <ArrowUp size={16} />
    </button>
  );
}
