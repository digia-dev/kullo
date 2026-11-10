export type ClientSyncState = "idle" | "syncing" | "saved" | "error";

/**
 * Small client-side signal for the global connection indicator.
 * It reflects the save that is actually in flight; it is not an offline queue.
 */
export function notifySync(state: ClientSyncState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("kullo:sync", { detail: { state } }));
}
