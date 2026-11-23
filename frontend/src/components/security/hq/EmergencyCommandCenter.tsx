"use client";

import { AlertTriangle, MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface ActiveAlert {
  id: string;
  type: "LIFE_UNDER_THREAT" | "MEDICAL_ALERT" | "INTRUSION";
  resident: string;
  location: string;
  detail: string;
  time: string;
}

interface HQEmergencyProps {
  alerts: ActiveAlert[];
  highPriorityCount: number;
}

const TYPE_META = {
  LIFE_UNDER_THREAT: { label: "LIFE UNDER THREAT", bg: "bg-[--color-danger-light]", border: "border-[--color-danger]", text: "text-[--color-danger]" },
  MEDICAL_ALERT:     { label: "MEDICAL ALERT",     bg: "bg-[--color-warning-light]", border: "border-[--color-warning]", text: "text-[--color-warning]" },
  INTRUSION:         { label: "INTRUSION",          bg: "bg-[--color-info-light]",    border: "border-[--color-info]",    text: "text-[--color-info]"    },
};

export default function EmergencyCommandCenter({ alerts, highPriorityCount }: HQEmergencyProps) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[--color-danger]" />
          <h2 className="text-sm font-semibold text-[--color-text]">Emergency Command Center</h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[--color-danger]">
          <span className="w-2 h-2 rounded-full bg-[--color-danger] animate-pulse" />
          {highPriorityCount} High Priority Alert{highPriorityCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Alerts + Map */}
      <div className="flex gap-0 flex-col md:flex-row">
        {/* Alert list */}
        <div className="flex-1 divide-y divide-[--color-border]">
          {alerts.map((alert) => {
            const meta = TYPE_META[alert.type];
            return (
              <div
                key={alert.id}
                className={cn("p-4 border-l-4", meta.border, meta.bg)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wide", meta.text)}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-[--color-text-muted]">{alert.time}</span>
                </div>
                <p className="text-sm font-semibold text-[--color-text]">{alert.resident}</p>
                <p className="text-xs text-[--color-text-muted] mt-0.5">{alert.location}</p>
                <p className="text-xs text-[--color-text-muted]">{alert.detail}</p>
                {alert.type === "LIFE_UNDER_THREAT" && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--color-danger] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Truck className="w-3 h-3" /> Dispatch
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-[--color-danger] text-[--color-danger] text-xs font-semibold hover:bg-[--color-danger-light] transition-colors">
                      Team
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactical map placeholder */}
        <div className="w-full md:w-44 bg-gray-100 relative min-h-[180px] flex items-center justify-center shrink-0">
          <span className="text-xs text-[--color-text-subtle]">Tactical Map</span>
          {/* Villa pin */}
          <div className="absolute top-8 right-6 flex flex-col items-center gap-0.5">
            <span className="w-3 h-3 rounded-full bg-[--color-danger]" />
            <span className="text-[9px] font-bold bg-white border border-[--color-danger] text-[--color-danger] px-1 rounded">VILLA 402</span>
          </div>
          {/* Patrol pin */}
          <div className="absolute bottom-10 left-6 flex flex-col items-center gap-0.5">
            <MapPin className="w-3 h-3 text-[--color-primary]" />
            <span className="text-[9px] font-bold bg-white border border-[--color-primary] text-[--color-primary] px-1 rounded">PATROL-B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
