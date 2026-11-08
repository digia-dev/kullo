"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TaskDrawer } from "./TaskDrawer";

export function TaskDrawerHost() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const taskId = params.get("task");

  if (!taskId) return null;

  const close = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("task");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return <TaskDrawer taskId={taskId} onClose={close} onChanged={() => router.refresh()} />;
}
