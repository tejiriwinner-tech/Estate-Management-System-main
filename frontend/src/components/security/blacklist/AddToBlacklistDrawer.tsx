"use client";

import { X, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/security/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: BlacklistFormData) => void | Promise<void>;
}

interface BlacklistFormData {
  name: string;
  entityId: string;
  reason: string;
  riskLevel: string;
  details: string;
  notifyOfficers: boolean;
}

export default function AddToBlacklistDrawer({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<BlacklistFormData>({
    name: "",
    entityId: "",
    reason: "",
    riskLevel: "ELEVATED",
    details: "",
    notifyOfficers: true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(form);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[--color-border]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[--color-danger]" />
            <h2 className="text-base font-bold text-[--color-text]">Add to Blacklist</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-[--color-text-muted]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[--color-text] mb-1.5">Full Name / Entity Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Julian Vance"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-[--color-border] rounded-lg outline-none focus:border-[--color-primary] transition-colors"
            />
          </div>

          {/* ID */}
          <div>
            <label className="block text-xs font-semibold text-[--color-text] mb-1.5">Entity / Resident ID</label>
            <input
              type="text"
              placeholder="e.g. ID: LE-99101-X"
              value={form.entityId}
              onChange={(e) => setForm((p) => ({ ...p, entityId: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-[--color-border] rounded-lg outline-none focus:border-[--color-primary] transition-colors"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[--color-text] mb-1.5">Reason for Restriction</label>
            <input
              type="text"
              required
              placeholder="e.g. Repeated Trespass"
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-[--color-border] rounded-lg outline-none focus:border-[--color-primary] transition-colors"
            />
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-xs font-semibold text-[--color-text] mb-1.5">Risk Level</label>
            <div className="grid grid-cols-3 gap-2">
              {["EXTREME", "ELEVATED", "LOW"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, riskLevel: level }))}
                  className={cn(
                    "py-2 rounded-lg text-xs font-bold border transition-colors",
                    form.riskLevel === level
                      ? level === "EXTREME"
                        ? "bg-[--color-danger] text-white border-[--color-danger]"
                        : level === "ELEVATED"
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-gray-500 text-white border-gray-500"
                      : "bg-white text-[--color-text-muted] border-[--color-border] hover:bg-gray-50"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-semibold text-[--color-text] mb-1.5">Additional Details</label>
            <textarea
              rows={3}
              placeholder="Describe the incident or reason in detail..."
              value={form.details}
              onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-[--color-border] rounded-lg outline-none focus:border-[--color-primary] transition-colors resize-none"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold text-[--color-text] mb-1.5">Supporting Evidence (optional)</label>
            <button
              type="button"
              className="w-full py-4 rounded-lg border-2 border-dashed border-[--color-border] flex flex-col items-center gap-1.5 text-[--color-text-muted] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">Upload Photo or Document</span>
            </button>
          </div>

          {/* Notify toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((p) => ({ ...p, notifyOfficers: !p.notifyOfficers }))}
              className={cn(
                "w-10 h-6 rounded-full relative transition-colors",
                form.notifyOfficers ? "bg-[--color-primary]" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  form.notifyOfficers ? "translate-x-5" : "translate-x-1"
                )}
              />
            </div>
            <span className="text-xs font-medium text-[--color-text]">Notify all on-duty officers</span>
          </label>
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[--color-border] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[--color-border] text-sm font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg bg-[--color-danger] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> Add to Blacklist
          </button>
        </div>
      </div>
    </>
  );
}
