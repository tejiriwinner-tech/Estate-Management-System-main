"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/security/utils";

export interface ResidentRow {
  id: string;
  name: string;
  tag: string;
  status: "RESTRICTED" | "ACTIVE_EMERGENCY" | "PENDING_EXIT" | "VERIFIED";
  lastActivity: string;
  avatarUrl?: string;
}

interface ResidentAccessTableProps {
  rows: ResidentRow[];
}

const STATUS_STYLES: Record<ResidentRow["status"], { label: string; className: string }> = {
  RESTRICTED:       { label: "RESTRICTED",       className: "bg-[--color-danger-light]  text-[--color-danger]  border border-[--color-danger]"  },
  ACTIVE_EMERGENCY: { label: "ACTIVE EMERGENCY",  className: "bg-orange-50               text-orange-600         border border-orange-400"        },
  PENDING_EXIT:     { label: "PENDING EXIT",       className: "bg-gray-100                text-gray-500           border border-gray-300"          },
  VERIFIED:         { label: "VERIFIED",           className: "bg-[--color-success-light] text-[--color-success]  border border-[--color-success]" },
};

const STATUS_OPTIONS = ["All", "RESTRICTED", "ACTIVE_EMERGENCY", "PENDING_EXIT", "VERIFIED"] as const;

export default function ResidentAccessTable({ rows }: ResidentAccessTableProps) {
  const [filter, setFilter] = useState<string>("All");

  const visible = filter === "All" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text]">Resident &amp; Access Monitoring</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs border border-[--color-border] rounded-lg px-2 py-1.5 text-[--color-text-muted] bg-white outline-none focus:border-[--color-primary]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "All" ? "Status: All" : o.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-bg]">
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">RESIDENT / USER</th>
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-4 py-2.5">STATUS</th>
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-4 py-2.5">LAST ACTIVITY</th>
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-4 py-2.5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {visible.map((row) => {
              const s = STATUS_STYLES[row.status];
              return (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {/* Name */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[--color-primary-light] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-[--color-primary]" />
                      </div>
                      <div>
                        <p className="font-medium text-[--color-text] text-xs leading-tight">{row.name}</p>
                        <p className="text-[10px] text-[--color-text-muted] mt-0.5">{row.tag}</p>
                      </div>
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap", s.className)}>
                      {s.label}
                    </span>
                  </td>
                  {/* Last activity */}
                  <td className="px-4 py-3 text-xs text-[--color-text-muted] whitespace-nowrap">{row.lastActivity}</td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button className="text-xs font-semibold text-[--color-primary] hover:underline">Profile</button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-xs text-center text-[--color-text-muted]">No residents match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
