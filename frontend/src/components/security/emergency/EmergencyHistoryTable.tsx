"use client";

import { useState } from "react";
import { Flame, Shield, Heart, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/security/utils";

export interface HistoryRow {
  id: string;
  date: string;
  time: string;
  alertType: "Fire Alarm" | "Intrusion Sensor" | "Medical" | "Suspicious Activity" | "Life Threat" | "Intelligence";
  resident: string;
  location: string;
  status: "Resolved" | "Investigating" | "Pending" | "Escalated";
}

const TYPE_ICON: Record<HistoryRow["alertType"], React.ReactNode> = {
  "Fire Alarm":          <Flame  className="w-3.5 h-3.5 text-orange-500" />,
  "Intrusion Sensor":    <Shield className="w-3.5 h-3.5 text-blue-500"   />,
  "Medical":             <Heart  className="w-3.5 h-3.5 text-[--color-danger]" />,
  "Suspicious Activity": <Eye    className="w-3.5 h-3.5 text-yellow-500" />,
  "Life Threat":         <Heart  className="w-3.5 h-3.5 text-[--color-danger]" />,
  "Intelligence":        <Eye    className="w-3.5 h-3.5 text-yellow-500" />,
};

const STATUS_STYLES: Record<HistoryRow["status"], string> = {
  Resolved:     "bg-[--color-success-light] text-[--color-success]",
  Investigating:"bg-blue-50 text-blue-600",
  Pending:      "bg-yellow-50 text-yellow-600",
  Escalated:    "bg-[--color-danger-light] text-[--color-danger]",
};

interface Props {
  rows: HistoryRow[];
  total: number;
}

export default function EmergencyHistoryTable({ rows, total }: Props) {
  const [range, setRange] = useState("Last 24 Hours");

  return (
    <div className="bg-white rounded-xl border border-[--color-border]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text]">Emergency History</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="text-xs border border-[--color-border] rounded-lg px-2 py-1.5 text-[--color-text-muted] bg-white outline-none focus:border-[--color-primary]"
        >
          {["Last 24 Hours", "Last 7 Days", "Last 30 Days", "All Time"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-bg]">
              {["DATE & TIME", "ALERT TYPE", "RESIDENT", "LOCATION", "STATUS", "ACTION"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-[--color-text-muted] px-5 py-2.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs font-medium text-[--color-text]">{row.date}</p>
                  <p className="text-[10px] text-[--color-text-muted]">{row.time}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {TYPE_ICON[row.alertType]}
                    <span className="text-xs text-[--color-text]">{row.alertType}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-[--color-text]">{row.resident}</td>
                <td className="px-5 py-3 text-xs text-[--color-text-muted] whitespace-nowrap">{row.location}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", STATUS_STYLES[row.status])}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-xs font-semibold text-[--color-primary] hover:underline flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[--color-border]">
        <p className="text-xs text-[--color-text-muted]">
          Showing 1–{rows.length} of {total} emergency events
        </p>
      </div>
    </div>
  );
}
