"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Radio, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { EMERGENCY_CODE_LIST, type EmergencyCodeKey } from "@/lib/emergencyCodes";

interface CodedEmergencyTriggerProps {
  senderName: string;
  senderRole: "Resident" | "Shop Owner" | "Agent" | "Admin";
  senderEmail?: string;
  defaultLocation: string;
  buttonLabel?: string;
  compact?: boolean;
}

export function CodedEmergencyTrigger({
  senderName,
  senderRole,
  senderEmail,
  defaultLocation,
  buttonLabel = "SOS Emergency Alert",
  compact = false,
}: CodedEmergencyTriggerProps) {
  const [open, setOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<EmergencyCodeKey>("CODE_RED");
  const [location, setLocation] = useState(defaultLocation);
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"form" | "sending" | "sent" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    setPhase("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/emergency/coded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selectedCode,
          sender_name: senderName,
          sender_role: senderRole,
          sender_email: senderEmail,
          location: location.trim(),
          note: note.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json?.message || "Failed to dispatch emergency alert.");
        setPhase("error");
        return;
      }
      setPhase("sent");
      setNote("");
    } catch {
      setErrorMsg("Network error reaching Security Command.");
      setPhase("error");
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setPhase("form");
    setErrorMsg("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPhase("form");
          setOpen(true);
        }}
        className={
          compact
            ? "inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100 transition-colors"
            : "flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-red-700 bg-red-50 border border-red-200/80 hover:bg-red-100 transition-colors shadow-2xs"
        }
      >
        <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
        <span>{buttonLabel}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          onClick={resetAndClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#B22222] text-white">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 animate-pulse text-[#C9A227]" />
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight">
                    Instant Security Command Alert
                  </h2>
                  <p className="text-[11px] text-red-100">
                    {senderName} • {senderRole} • Received immediately by Security HQ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {phase === "sent" ? (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Alert Transmitted to Security HQ
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Security officers have been notified with your exact location (<strong>{location}</strong>) and emergency protocol.
                </p>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="mt-6 w-full rounded-xl bg-[#B22222] py-2.5 text-xs font-bold text-white hover:bg-[#991B1B]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleDispatch} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Emergency Protocol Code
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EMERGENCY_CODE_LIST.map((spec) => {
                      const active = selectedCode === spec.key;
                      return (
                        <button
                          key={spec.key}
                          type="button"
                          onClick={() => setSelectedCode(spec.key)}
                          className={`text-left rounded-xl border p-3 transition-all ${
                            active
                              ? `${spec.cardClass} ring-2 ring-[#B22222] shadow-xs`
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${spec.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${spec.dotClass}`} />
                              {spec.label}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {spec.priority}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {spec.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Exact Location / Unit / Shop / Gate
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Villa A-402, Commercial Plaza Shop A-02, Gate 1..."
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Situation Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Briefly describe what is happening so Security dispatches the right team..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                  />
                </div>

                {phase === "error" && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={phase === "sending"}
                    className="flex-1 rounded-xl bg-[#B22222] py-2.5 text-xs font-extrabold text-white hover:bg-[#991B1B] shadow-md disabled:opacity-60"
                  >
                    {phase === "sending" ? "Transmitting..." : "Dispatch Alert Now"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
