"use client";

import React, { useState } from "react";
import { Plus, Clock, CheckCircle2, X } from "lucide-react";
import { ReminderItem } from "@/types/admin/dashboard";

interface RemindersWidgetProps {
  initialReminders?: ReminderItem[];
}

export function RemindersWidget({ initialReminders }: RemindersWidgetProps) {
  const [reminders, setReminders] = useState<ReminderItem[]>(
    initialReminders || [
      {
        id: "1",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
        time: "9:30am",
        completed: false,
      },
      {
        id: "2",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
        time: "9:30am",
        completed: false,
      },
      {
        id: "3",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
        time: "9:30am",
        completed: false,
      },
    ]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newReminder: ReminderItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      time: newTime || "Just now",
      completed: false,
    };

    setReminders((prev) => [...prev, newReminder]);
    setNewText("");
    setNewTime("");
    setIsModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  return (
    <div className="flex flex-col justify-between p-6 sm:p-8 bg-surface-card rounded-2xl border border-border/80 shadow-card">
      <div>
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-dark tracking-tight">
            Reminder
          </h2>
          <div className="w-10 h-1 bg-primary mx-auto mt-2 rounded-full" />
        </div>

        {/* Reminders List */}
        <div className="space-y-6">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              onClick={() => toggleComplete(reminder.id)}
              className="flex items-start gap-4 group cursor-pointer"
            >
              {/* Bullet / Status Indicator */}
              <div className="pt-0.5">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    reminder.completed
                      ? "bg-primary border-primary"
                      : "bg-primary/20 border-primary group-hover:scale-110"
                  }`}
                />
              </div>

              {/* Text content & Time */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border/40 pb-4">
                <p
                  className={`text-sm leading-relaxed ${
                    reminder.completed
                      ? "line-through text-muted/60"
                      : "text-dark font-medium"
                  }`}
                >
                  {reminder.text}
                </p>
                <span className="text-xs font-semibold text-muted whitespace-nowrap self-end sm:self-auto">
                  {reminder.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Reminder Button styled with Primary #B22222 */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Interactive Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-surface-card rounded-2xl shadow-elevated border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-dark">Add New Reminder</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted hover:text-dark rounded-lg hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark uppercase mb-1">
                  Reminder Note
                </label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. Schedule generator maintenance at Block C..."
                  className="w-full p-3 rounded-xl border border-border text-sm text-dark placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark uppercase mb-1">
                  Time / Due
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 10:30am or Tomorrow"
                  className="w-full h-10 px-3 rounded-xl border border-border text-sm text-dark placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-dark hover:bg-surface-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

