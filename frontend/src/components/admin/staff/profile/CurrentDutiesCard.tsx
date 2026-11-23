"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Building2,
  FileText,
  Handshake,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { StaffDuty, DutyFrequency, DutyIcon } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

const iconMap: Record<DutyIcon, React.ElementType> = {
  building: Building2,
  file: FileText,
  handshake: Handshake,
  wrench: Wrench,
  shield: ShieldCheck,
};

const badgeStyles: Record<DutyFrequency, string> = {
  daily: "bg-accent-light text-accent-hover",
  urgent: "bg-primary-light text-primary",
  weekly: "bg-surface-subtle text-dark border border-border",
  monthly: "bg-surface-subtle text-muted border border-border",
};

interface CurrentDutiesCardProps {
  duties: StaffDuty[];
}

export function CurrentDutiesCard({ duties }: CurrentDutiesCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? duties : duties.slice(0, 3);

  return (
    <div className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-card h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-dark tracking-tight">
          <ClipboardList className="w-5 h-5 text-accent" />
          Current Duties
        </h2>
        {duties.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-hover transition-colors no-print"
          >
            {showAll ? "Show Less" : "View All"}
            <ArrowRight className={cn("w-3.5 h-3.5 transition-transform", showAll && "-rotate-90")} />
          </button>
        )}
      </div>

      <ul className="mt-4 divide-y divide-border/60">
        {visible.map((duty) => {
          const Icon = iconMap[duty.icon];
          return (
            <li key={duty.id} className="flex items-center gap-3.5 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-dark truncate">{duty.title}</div>
                <div className="text-xs text-muted font-medium truncate">{duty.subtitle}</div>
              </div>
              <span
                className={cn(
                  "shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  badgeStyles[duty.frequency]
                )}
              >
                {duty.frequency}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
