"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type Tone = "success" | "error" | "info";
type Item = { id: number; message: string; tone: Tone };

export function toast(message: string, tone: Tone = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("kullo:toast", { detail: { message, tone } }));
}

export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; tone: Tone }>).detail;
      if (!detail?.message) return;
      const id = Date.now() + Math.random();
      setItems((value) => [...value, { id, message: detail.message, tone: detail.tone ?? "success" }]);
      window.setTimeout(() => setItems((value) => value.filter((item) => item.id !== id)), 3400);
    };
    window.addEventListener("kullo:toast", onToast);
    return () => window.removeEventListener("kullo:toast", onToast);
  }, []);

  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((item) => {
        const Icon = item.tone === "error" ? XCircle : item.tone === "info" ? Info : CheckCircle2;
        return (
          <div key={item.id} className={`toast toast-${item.tone}`}>
            <Icon size={16} />
            <span>{item.message}</span>
          </div>
        );
      })}
    </div>
  );
}
