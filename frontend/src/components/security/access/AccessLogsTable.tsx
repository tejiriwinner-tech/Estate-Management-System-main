"use client";

import { QrCode, Fingerprint, Scan } from "lucide-react";
import { cn } from "@/lib/security/utils";

export type VerificationType = "Face ID" | "QR Code" | "Manual" | "Biometric";
export type AccessStatus = "Authorised" | "Success" | "Denied" | "Flagged";

export interface AccessLogRow {
  id: string;
  name: string;
  role: string;
  tag?: string;
  gateNo: string;
  verificationType: VerificationType;
  status: AccessStatus;
  timestamp: string;
}

const STATUS_STYLES: Record<AccessStatus, string> = {
  Authorised: "bg-[--color-primary-light] text-[--color-primary] border border-[--color-primary]",
  Success:    "bg-[--color-success-light] text-[--color-success] border border-[--color-success]",
  Denied:     "bg-[--color-danger-light]  text-[--color-danger]  border border-[--color-danger]",
  Flagged:    "bg-yellow-50               text-yellow-700         border border-yellow-400",
};

const VERIF_ICON: Record<VerificationType, React.ReactNode> = {
  "Face ID":   <Scan        className="w-3.5 h-3.5 text-[--color-primary]" />,
  "QR Code":   <QrCode      className="w-3.5 h-3.5 text-[--color-primary]" />,
  "Manual":    <Fingerprint className="w-3.5 h-3.5 text-[--color-warning]" />,
  "Biometric": <Fingerprint className="w-3.5 h-3.5 text-[--color-primary]" />,
};

interface Props {
  rows: AccessLogRow[];
  total: number;
}

export default function AccessLogsTable({ rows, total }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border]">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text]">Detailed Access Logs</h2>
        <div className="flex items-center gap-3 ml-auto">
          {[
            { label: "Success", color: "bg-[--color-success]" },
            { label: "Denied",  color: "bg-[--color-danger]"  },
            { label: "Flagged", color: "bg-yellow-500"        },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", l.color)} />
              <span className="text-[10px] font-medium text-[--color-text-muted]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-bg]">
              {["NAME / ENTITY", "GATE NO.", "VERIFICATION TYPE", "STATUS", "TIMESTAMP", "ACTION"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-[--color-text-muted] px-5 py-2.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {rows.map((row) => (
              <tr key={row.id} className={cn(
                "hover:bg-gray-50 transition-colors",
                row.status === "Denied" && "bg-[--color-danger-light]/30"
              )}>
                {/* Name */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-white",
                      row.status === "Denied" ? "bg-[--color-danger]" : "bg-[--color-primary]"
                    )}>
                      {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className={cn("text-xs font-semibold", row.tag === "Blacklisted Attempt" ? "text-[--color-danger]" : "text-[--color-text]")}>
                        {row.name}
                      </p>
                      <p className="text-[10px] text-[--color-text-muted]">{row.role}</p>
                      {row.tag && (
                        <p className="text-[9px] text-[--color-danger] font-semibold">{row.tag}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* Gate */}
                <td className="px-5 py-3 text-xs text-[--color-text-muted] whitespace-nowrap">{row.gateNo}</td>
                {/* Verification */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {VERIF_ICON[row.verificationType]}
                    <span className="text-xs text-[--color-text]">{row.verificationType}</span>
                  </div>
                </td>
                {/* Status */}
                <td className="px-5 py-3">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap", STATUS_STYLES[row.status])}>
                    {row.status}
                  </span>
                </td>
                {/* Timestamp */}
                <td className="px-5 py-3 text-xs text-[--color-text-muted] tabular-nums">{row.timestamp}</td>
                {/* Action */}
                <td className="px-5 py-3">
                  <button className="text-xs font-semibold text-[--color-primary] hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[--color-border]">
        <p className="text-xs text-[--color-text-muted]">Showing {rows.length} of {total.toLocaleString()} results today</p>
      </div>
    </div>
  );
}
