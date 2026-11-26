"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Crosshair, MapPin, Radio, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { EMERGENCY_CODE_LIST, type EmergencyCodeKey } from "@/lib/emergencyCodes";
import { readStoredGps } from "@/components/location/LiveGpsTracker";

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
  const [gpsStatus, setGpsStatus] = useState<"idle" | "locating" | "locked" | "denied">(() =>
    readStoredGps() ? "locked" : "idle"
  );
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(() => {
    const s = readStoredGps();
    return s ? { lat: s.lat, lng: s.lng, accuracy: s.accuracy } : null;
  });

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 0),
        });
        setGpsStatus("locked");
      },
      () => {
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }, []);

  useEffect(() => {
    if (open) {
      requestGps();
    }
  }, [open, requestGps]);

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
          latitude: gpsCoords?.lat ?? null,
          longitude: gpsCoords?.lng ?? null,
          accuracy: gpsCoords?.accuracy ?? null,
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

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
            onClick={resetAndClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-[#B22222] text-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Radio className="w-5 h-5 animate-pulse text-[#C9A227] shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-extrabold tracking-tight truncate">
                      Instant Security Command Alert
                    </h2>
                    <p className="text-[11px] text-red-100 truncate">
                      {senderName} • {senderRole} • Received immediately by Security HQ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {EMERGENCY_CODE_LIST.map((spec) => {
                        const active = selectedCode === spec.key;
                        return (
                          <button
                            key={spec.key}
                            type="button"
                            onClick={() => setSelectedCode(spec.key)}
                            className={`text-left rounded-xl border p-3.5 transition-all ${
                              active
                                ? `${spec.cardClass} ring-2 ring-[#B22222] shadow-xs`
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border whitespace-nowrap ${spec.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${spec.dotClass}`} />
                                {spec.label}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
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
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Exact Location / Unit / Shop / Gate
                      </label>
                      <button
                        type="button"
                        onClick={requestGps}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B22222] hover:underline"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        {gpsStatus === "locating"
                          ? "Locking GPS..."
                          : gpsStatus === "locked"
                          ? "Refresh GPS"
                          : "Enable Live GPS"}
                      </button>
                    </div>
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
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                      {gpsStatus === "locked" && gpsCoords && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Live GPS Pin Locked: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)} (±{gpsCoords.accuracy}m)
                        </span>
                      )}
                      {gpsStatus === "locating" && (
                        <span className="text-amber-700 font-semibold">
                          Acquiring device GPS coordinates for Security map pinpoint...
                        </span>
                      )}
                      {gpsStatus === "denied" && (
                        <span className="text-slate-500">
                          Turn on device location / browser GPS permission to auto-pinpoint on Security map, or type your exact location above.
                        </span>
                      )}
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
          </div>,
          document.body
        )}
    </>
  );
}
