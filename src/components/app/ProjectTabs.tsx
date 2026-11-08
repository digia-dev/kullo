"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["overview", "Overview"],
  ["board", "Board"],
  ["list", "List"],
  ["timeline", "Timeline"],
  ["files", "Files"],
  ["settings", "Pengaturan"],
] as const;

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  return (
    <div className="tab-row" role="tablist" aria-label="Tampilan proyek">
      {TABS.map(([key, label]) => {
        const href = `/app/projects/${projectId}/${key}`;
        const active = pathname === href;
        return (
          <Link key={key} href={href} className={`tab ${active ? "active" : ""}`} role="tab" aria-selected={active} style={{ textDecoration: "none" }}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}
