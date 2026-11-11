"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import type { ClientSyncState } from "@/lib/client-sync";

/**
 * Connectivity plus the last write state. It never claims a save succeeded
 * until the server action has answered, and it does not pretend to have an
 * offline queue.
 */
export function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  const [sync, setSync] = useState<ClientSyncState>("idle");
  const savedTimer = useRef<number | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onSync = (event: Event) => {
      const state = (event as CustomEvent<{ state: ClientSyncState }>).detail?.state;
      if (!state) return;
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      setSync(state);
      if (state === "saved") {
        savedTimer.current = window.setTimeout(() => setSync("idle"), 2200);
      }
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("kullo:sync", onSync);
    return () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("kullo:sync", onSync);
    };
  }, []);

  const state = !online ? "offline" : sync;
  if (state === "idle") return null;
  const label =
    state === "offline"
      ? "Luring"
      : state === "syncing"
        ? "Menyinkronkan"
        : state === "saved"
          ? "Tersimpan"
          : state === "error"
            ? "Gagal menyimpan"
            : "";
  const Icon =
    state === "offline"
      ? CloudOff
      : state === "syncing"
        ? Loader2
        : state === "saved"
          ? Check
          : state === "error"
            ? AlertTriangle
            : Cloud;

  return (
    <span className={`connection-status ${state}`} role="status" aria-live="polite" title={label}>
      <Icon size={13} className={state === "syncing" ? "animate-spin" : undefined} aria-hidden />
      <span>{label}</span>
    </span>
  );
}
