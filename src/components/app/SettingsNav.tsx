"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/app/settings/profile", "Profil"],
  ["/app/settings/organization", "Organisasi"],
  ["/app/settings/members", "Anggota"],
  ["/app/settings/departments", "Departemen"],
  ["/app/settings/roles", "Role & izin"],
  ["/app/settings/notifications", "Notifikasi"],
  ["/app/settings/integrations", "Integrasi"],
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="tab-row" style={{ marginBottom: 16 }}>
      {ITEMS.map(([href, label]) => (
        <Link key={href} href={href} className={`tab ${pathname === href ? "active" : ""}`} style={{ textDecoration: "none" }}>
          {label}
        </Link>
      ))}
    </div>
  );
}
