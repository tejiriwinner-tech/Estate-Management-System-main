"use client";

import { Plus, Clock } from "lucide-react";
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

const PRIORITY_DOT: Record<string, string> = {
  high:   "bg-[--color-danger]",
  medium: "bg-[--color-warning]",
  low:    "bg-[--color-primary]",
};

export default function ReminderPanel({ reminders, onAdd }: ReminderPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text]">Reminder</h2>
        <span className="text-xs text-[--color-text-muted]">{reminders.length} items</span>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-[--color-border]">
        {reminders.map((r) => (
          <li key={r.id} className="flex items-start gap-3 px-5 py-3.5">
            <span
              className={cn(
                "mt-1.5 w-2 h-2 rounded-full shrink-0",
                PRIORITY_DOT[r.priority ?? "low"]
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[--color-text] leading-snug line-clamp-2">{r.text}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-[--color-text-subtle]" />
                <span className="text-xs text-[--color-text-muted]">{r.time}</span>
              </div>
            </div>
          </li>
        ))}
        {reminders.length === 0 && (
          <li className="px-5 py-6 text-sm text-[--color-text-muted] text-center">
            No reminders yet.
          </li>
        )}
      </ul>

      {/* Add button */}
      <div className="px-5 py-4 border-t border-[--color-border]">
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[--color-primary] hover:bg-[--color-primary-dark] text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>
    </div>
  );
}
