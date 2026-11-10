"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Di layar kecil, buka daftar dalam tampilan List bila URL belum menentukan view.
 * Dipakai halaman Proyek; deteksi memakai matchMedia agar juga benar di mode responsif.
 */
export function MobileDefaultList() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view")) return;
    params.set("view", "list");
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router]);

  return null;
}
