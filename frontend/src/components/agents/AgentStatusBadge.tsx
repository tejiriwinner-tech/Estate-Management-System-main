import React from "react";
import { AgentStatus } from "@/types/agent";

const styles: Record<AgentStatus, { pill: string; dot: string }> = {
  Active: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  "On Leave": { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Inactive: { pill: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${s.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
