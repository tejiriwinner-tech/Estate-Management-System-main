"use client";

import { MoreVertical, Building2, Wifi, Car, User } from "lucide-react";
import { cn } from "@/lib/security/utils";

export type WatchlistType = "organisation" | "network" | "vehicle" | "person";
export type WatchlistRisk = "Level 5 (Red)" | "Level 4 (Orange)" | "Level 3 (Amber)" | "Level 2 (Yellow)" | "Level 1 (Grey)";

export interface WatchlistAccount {
  id: string;
  name: string;
  subtitle: string;
  type: WatchlistType;
  riskLevel: WatchlistRisk;
  riskFactor: string;
  linkedUnit?: string;
  accessNode?: string;
  vehicle?: string;
  action: "Review Ledger" | "Isolate Port" | "Track Movement" | "Review Profile";
}

const RISK_COLOR: Record<WatchlistRisk, string> = {
  "Level 5 (Red)":   "text-[--color-danger]",
  "Level 4 (Orange)":"text-orange-500",
  "Level 3 (Amber)": "text-[--color-warning]",
  "Level 2 (Yellow)":"text-yellow-600",
  "Level 1 (Grey)":  "text-gray-500",
};

const RISK_BAR: Record<WatchlistRisk, string> = {
  "Level 5 (Red)":   "bg-[--color-danger] w-full",
  "Level 4 (Orange)":"bg-orange-500 w-5/6",
  "Level 3 (Amber)": "bg-[--color-warning] w-2/3",
  "Level 2 (Yellow)":"bg-yellow-500 w-1/2",
  "Level 1 (Grey)":  "bg-gray-400 w-1/4",
};

const ACTION_STYLES: Record<WatchlistAccount["action"], string> = {
  "Review Ledger":  "border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-light]",
  "Isolate Port":   "border border-[--color-danger]  text-[--color-danger]  hover:bg-[--color-danger-light]",
  "Track Movement": "border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-light]",
  "Review Profile": "border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-light]",
};

const TYPE_ICON: Record<WatchlistType, React.ReactNode> = {
  organisation: <Building2 className="w-5 h-5 text-[--color-text-muted]" />,
  network:      <Wifi      className="w-5 h-5 text-[--color-danger]"      />,
  vehicle:      <Car       className="w-5 h-5 text-[--color-text-muted]"  />,
  person:       <User      className="w-5 h-5 text-[--color-text-muted]"  />,
};

interface Props {
  accounts: WatchlistAccount[];
}

export default function WatchlistAccounts({ accounts }: Props) {
  return (
    <div>
      <h2 className="text-sm font-bold text-[--color-text] mb-4">Watchlist Accounts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-xl border border-[--color-border] p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[--color-bg] flex items-center justify-center shrink-0">
                  {TYPE_ICON[acc.type]}
                </div>
                <div>
                  <p className="text-xs font-bold text-[--color-text] leading-tight">{acc.name}</p>
                  <p className="text-[10px] text-[--color-text-muted]">{acc.subtitle}</p>
                </div>
              </div>
              <button className="p-1 text-[--color-text-muted] hover:text-[--color-text]">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Risk factor */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[--color-text-muted]">Risk Factor</span>
              <span className={cn("text-[10px] font-bold", RISK_COLOR[acc.riskLevel])}>
                {acc.riskLevel}
              </span>
            </div>
            {/* Risk bar */}
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden -mt-2">
              <div className={cn("h-full rounded-full", RISK_BAR[acc.riskLevel])} />
            </div>

            {/* Meta */}
            {acc.linkedUnit && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[--color-text-muted]">Linked Unit</span>
                <span className="text-[10px] font-semibold text-[--color-text]">{acc.linkedUnit}</span>
              </div>
            )}
            {acc.accessNode && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[--color-text-muted]">Access Node</span>
                <span className="text-[10px] font-semibold text-[--color-text]">{acc.accessNode}</span>
              </div>
            )}
            {acc.vehicle && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[--color-text-muted]">Vehicle</span>
                <span className="text-[10px] font-semibold text-[--color-text]">{acc.vehicle}</span>
              </div>
            )}

            {/* Action button */}
            <button className={cn("w-full py-2 rounded-lg text-xs font-semibold transition-colors", ACTION_STYLES[acc.action])}>
              {acc.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
