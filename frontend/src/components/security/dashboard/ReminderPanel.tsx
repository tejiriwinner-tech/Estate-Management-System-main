"use client";

import { Clock, Plus, Check } from "lucide-react";
import { cn } from "@/lib/security/utils";

export interface Reminder {
  id: string;
  text: string;
  time: string;
  priority?: "high" | "medium" | "low";
}

interface ReminderPanelProps {
  reminders: Reminder[];
  onAdd?: () => void;
}

const PRIORITY_BADGE: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-red-50 border-red-200 text-red-700", text: "Urgent" },
  medium: { bg: "bg-amber-50 border-amber-200 text-amber-700", text: "Normal" },
  low: { bg: "bg-blue-50 border-blue-200 text-blue-700", text: "Routine" },
};

export default function ReminderPanel({ reminders, onAdd }: ReminderPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Duty Shift Reminders</h2>
          <p className="text-xs text-slate-500">Security checkpoint directives & patrol sweeps</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{reminders.length} items</span>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 mt-2">
        {reminders.map((r) => {
          const badge = PRIORITY_BADGE[r.priority ?? "low"] || PRIORITY_BADGE.low;
          return (
            <li key={r.id} className="py-3.5 first:pt-2 last:pb-2 flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-snug">{r.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Clock className="w-3 h-3" />
                    {r.time}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", badge.bg)}>
                    {badge.text}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
        {reminders.length === 0 && (
          <li className="py-8 text-center text-xs text-slate-400">
            No active shift reminders at this time.
          </li>
        )}
      </ul>

      {/* Add button */}
      {onAdd && (
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200 py-2.5 text-xs font-bold text-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shift Directives</span>
          </button>
        </div>
      )}
    </div>
  );
}
