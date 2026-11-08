"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "kullo:promo-dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("kullo:promo", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("kullo:promo", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(KEY) !== "1";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

export function PromoBar() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  return (
    <div className="promo hidden md:block">
      <div className="shell promo-inner">
        <div className="promo-art" aria-hidden>
          <svg viewBox="0 0 80 44" width="80" height="44" role="presentation">
            <rect width="80" height="44" fill="url(#promoGrad)" />
            <defs>
              <linearGradient id="promoGrad" x1="0" y1="0" x2="80" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1b2b63" />
                <stop offset="1" stopColor="#365fd1" />
              </linearGradient>
            </defs>
            <rect x="8" y="9" width="26" height="4" rx="2" fill="#ffffff" opacity=".92" />
            <rect x="8" y="17" width="40" height="3" rx="1.5" fill="#ffffff" opacity=".55" />
            <rect x="8" y="24" width="34" height="3" rx="1.5" fill="#ffffff" opacity=".4" />
            <rect x="8" y="32" width="18" height="4" rx="2" fill="#f5a524" />
            <rect x="52" y="12" width="20" height="22" rx="4" fill="#ffffff" opacity=".16" />
            <rect x="55" y="16" width="14" height="3" rx="1.5" fill="#ffffff" opacity=".75" />
            <rect x="55" y="22" width="10" height="3" rx="1.5" fill="#ffffff" opacity=".5" />
          </svg>
        </div>
        <div className="promo-copy">
          <div className="promo-title">Semua pekerjaan tim, dalam satu portal</div>
          <div className="promo-sub">
            Kullo menyatukan proyek, tugas, chat, dokumen, dan persetujuan. Gratis untuk 5 anggota pertama.
          </div>
        </div>
        <button
          type="button"
          className="utility-btn"
          onClick={() => {
            try {
              window.localStorage.setItem(KEY, "1");
            } catch {
              /* storage unavailable */
            }
            window.dispatchEvent(new Event("kullo:promo"));
          }}
        >
          Tidak, terima kasih
        </button>
        <Link href="/daftar" className="btn btn-primary" style={{ minWidth: 152 }}>
          Buat akun gratis
        </Link>
      </div>
    </div>
  );
}
