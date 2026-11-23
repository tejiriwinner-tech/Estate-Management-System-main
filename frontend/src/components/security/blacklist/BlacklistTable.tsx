"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/security/utils";

export type RiskLevel = "EXTREME" | "ELEVATED" | "LOW" | "MEDIUM" | "HIGH";
export type EntityStatus = "RESTRICTED" | "UNDER_OBSERVATION" | "UNDER_REVIEW" | "CLEARED";

export interface BlacklistEntry {
  id: string;
  name: string;
  entityId: string;
  reason: string;
  reasonDetail: string;
  riskLevel: RiskLevel;
  status: EntityStatus;
  lastAttemptedDate: string;
  lastAttemptedTime: string;
  lastAttemptedLocation: string;
  dateAdded?: string;
  securityLevel?: "High" | "Medium" | "Low";
  avatarUrl?: string;
}

type TabFilter = "All Entities" | "Restricted" | "Under Observation";

interface Props {
  entries: BlacklistEntry[];
  onViewProfile?: (id: string) => void;
  onAddToBlacklist?: () => void;
}

const RISK_STYLES: Record<RiskLevel, string> = {
  EXTREME:  "bg-[--color-danger-light]  text-[--color-danger]  border border-[--color-danger]",
  ELEVATED: "bg-yellow-50               text-yellow-700         border border-yellow-400",
  HIGH:     "bg-orange-50               text-orange-600         border border-orange-400",
  MEDIUM:   "bg-blue-50                 text-blue-600           border border-blue-400",
  LOW:      "bg-gray-100                text-gray-500           border border-gray-300",
};

const STATUS_STYLES: Record<EntityStatus, string> = {
  RESTRICTED:        "bg-[--color-danger-light] text-[--color-danger] border border-[--color-danger]",
  UNDER_OBSERVATION: "bg-yellow-50 text-yellow-700 border border-yellow-400",
  UNDER_REVIEW:      "bg-blue-50 text-blue-600 border border-blue-400",
  CLEARED:           "bg-[--color-success-light] text-[--color-success] border border-[--color-success]",
};

const STATUS_LABELS: Record<EntityStatus, string> = {
  RESTRICTED:        "RESTRICTED",
  UNDER_OBSERVATION: "UNDER OBSERVATION",
  UNDER_REVIEW:      "UNDER REVIEW",
  CLEARED:           "CLEARED",
};

const TABS: TabFilter[] = ["All Entities", "Restricted", "Under Observation"];

export default function BlacklistTable({ entries, onViewProfile }: Props) {
  const [activeTab, setActiveTab] = useState<TabFilter>("All Entities");

  const filtered = entries.filter((e) => {
    if (activeTab === "Restricted")        return e.status === "RESTRICTED";
    if (activeTab === "Under Observation") return e.status === "UNDER_OBSERVATION" || e.status === "UNDER_REVIEW";
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col">
      {/* Tabs + count */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-[--color-border]">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab
                  ? "border-[--color-primary] text-[--color-primary]"
                  : "border-transparent text-[--color-text-muted] hover:text-[--color-text]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-[--color-text-muted] pb-2.5">
          Showing {filtered.length} of {filtered.length} records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-bg]">
              {["SUBJECT IDENTITY", "REASON FOR RESTRICTION", "RISK LEVEL", "LAST ATTEMPTED ENTRY", "ACTIONS"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-[--color-text-muted] px-5 py-2.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {/* Identity */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[--color-primary-light] flex items-center justify-center shrink-0 overflow-hidden">
                      <User className="w-4 h-4 text-[--color-primary]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[--color-text]">{row.name}</p>
                      <p className="text-[10px] text-[--color-text-muted]">{row.entityId}</p>
                    </div>
                  </div>
                </td>
                {/* Reason */}
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-[--color-text]">{row.reason}</p>
                  <p className="text-[10px] text-[--color-danger] mt-0.5">{row.reasonDetail}</p>
                </td>
                {/* Risk level */}
                <td className="px-5 py-3">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap", RISK_STYLES[row.riskLevel])}>
                    ● {row.riskLevel}
                  </span>
                </td>
                {/* Last attempted */}
                <td className="px-5 py-3">
                  <p className="text-xs text-[--color-text]">
                    {row.lastAttemptedDate} ● {row.lastAttemptedTime}
                  </p>
                  <p className="text-[10px] text-[--color-text-muted] mt-0.5">{row.lastAttemptedLocation}</p>
                </td>
                {/* Actions */}
                <td className="px-5 py-3">
                  <button
                    onClick={() => onViewProfile?.(row.id)}
                    className="text-xs font-semibold text-[--color-primary] hover:underline whitespace-nowrap"
                  >
                    View Full Profile
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-xs text-center text-[--color-text-muted]">
                  No entries match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[--color-border]">
        <span className="text-xs text-[--color-text-muted]">Page 1 of 1</span>
        <div className="flex gap-1">
          <button className="w-7 h-7 rounded-lg border border-[--color-primary] bg-[--color-primary] text-white text-xs font-bold">1</button>
        </div>
      </div>
    </div>
  );
}
