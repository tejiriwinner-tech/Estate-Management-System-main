"use client";

import { Radio, Eye, MoreVertical, Clock } from "lucide-react";
import { cn } from "@/lib/security/utils";

export type AlertSeverity = "CRITICAL" | "MEDICAL" | "INTRUSION" | "SUSPICIOUS";

export interface ActiveAlertData {
  id: string;
  severity: AlertSeverity;
  title: string;
  location: string;
  section: string;
  detail: string;
  resident: string;
  timeElapsed: string;
  dispatched: string;
  eta?: string;
  status?: string;
  variant: "primary" | "secondary";
}

const SEVERITY_STYLES: Record<AlertSeverity, { tag: string; tagBg: string; border: string }> = {
  CRITICAL:   { tag: "CRITICAL ALERT", tagBg: "bg-[--color-danger] text-white",                 border: "border-[--color-danger]"  },
  MEDICAL:    { tag: "MEDICAL",         tagBg: "bg-blue-500 text-white",                         border: "border-blue-400"          },
  INTRUSION:  { tag: "INTRUSION",       tagBg: "bg-orange-500 text-white",                       border: "border-orange-400"        },
  SUSPICIOUS: { tag: "SUSPICIOUS",      tagBg: "bg-yellow-500 text-white",                       border: "border-yellow-400"        },
};

interface Props {
  alert: ActiveAlertData;
  onResolve?: (id: string) => void;
  onDetails?: (id: string) => void;
}

export default function ActiveAlertCard({ alert, onResolve, onDetails }: Props) {
  const styles = SEVERITY_STYLES[alert.severity];

  if (alert.variant === "secondary") {
    return (
      <div className={cn("bg-white rounded-xl border-2 p-4 flex flex-col gap-3", styles.border)}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide", styles.tagBg)}>
              {styles.tag}
            </span>
            <p className="text-sm font-bold text-[--color-text] mt-1.5">{alert.title}</p>
          </div>
          <span className="text-[10px] text-[--color-text-muted] shrink-0">{alert.timeElapsed}</span>
        </div>
        <div className="text-xs text-[--color-text-muted] space-y-1">
          <p><span className="font-medium text-[--color-text]">Resident:</span> {alert.resident}</p>
          <p><span className="font-medium text-[--color-text]">Location:</span> {alert.location}</p>
          {alert.status && (
            <p className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[--color-success] inline-block" />
              <span className="text-[--color-success] font-medium">{alert.status}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onDetails?.(alert.id)}
            className="flex-1 py-2 rounded-lg border border-[--color-border] text-xs font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onResolve?.(alert.id)}
            className="flex-1 py-2 rounded-lg bg-[--color-primary] text-white text-xs font-semibold hover:bg-[--color-primary-dark] transition-colors"
          >
            Resolve
          </button>
        </div>
      </div>
    );
  }

  // Primary (large) card
  return (
    <div className={cn("bg-white rounded-xl border-2 p-4 flex flex-col gap-4", styles.border)}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide", styles.tagBg)}>
            {styles.tag}
          </span>
          <p className="text-base font-bold text-[--color-text] mt-1.5">{alert.title}</p>
          <p className="text-xs text-[--color-text-muted] mt-0.5">{alert.detail}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-[--color-text]">{alert.location}</p>
          <p className="text-[10px] text-[--color-text-muted]">{alert.section}</p>
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-[--color-bg] rounded-lg px-3 py-2 min-w-[80px]">
          <p className="text-[9px] text-[--color-text-subtle] uppercase font-semibold tracking-wide">Resident</p>
          <p className="text-xs font-bold text-[--color-text] mt-0.5">{alert.resident}</p>
        </div>
        <div className="bg-[--color-danger-light] rounded-lg px-3 py-2 min-w-[80px]">
          <p className="text-[9px] text-[--color-text-subtle] uppercase font-semibold tracking-wide">Time Elapsed</p>
          <p className="text-sm font-bold text-[--color-danger] mt-0.5 tabular-nums">{alert.timeElapsed}</p>
        </div>
        <div className="bg-[--color-bg] rounded-lg px-3 py-2 min-w-[80px]">
          <p className="text-[9px] text-[--color-text-subtle] uppercase font-semibold tracking-wide">Dispatched</p>
          <p className="text-xs font-bold text-[--color-text] mt-0.5">{alert.dispatched}</p>
          {alert.eta && <p className="text-[9px] text-[--color-text-muted]">{alert.eta}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-danger] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          <Radio className="w-3.5 h-3.5" /> Open Channel
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[--color-danger] text-[--color-danger] text-xs font-semibold hover:bg-[--color-danger-light] transition-colors">
          <Eye className="w-3.5 h-3.5" /> View Live Feed
        </button>
        <button className="ml-auto p-2 rounded-lg border border-[--color-border] text-[--color-text-muted] hover:bg-gray-50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
