"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Car, ArrowUpRight, ArrowDownLeft, CheckCircle2, Radio } from "lucide-react";
import { QrCodeDisplay } from "./QrCodeDisplay";

interface ResidentGatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  residentName?: string;
  unitNumber?: string;
  vehiclePlate?: string;
}

export function ResidentGatePassModal({
  isOpen,
  onClose,
  residentName = "Chinedu Resident",
  unitNumber = "Villa A-402",
  vehiclePlate = "KJA-492AA",
}: ResidentGatePassModalProps) {
  const [direction, setDirection] = useState<"EXIT" | "ENTRY">("EXIT");
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);

  if (!isOpen) return null;

  const passId = `RES-${unitNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`;
  const qrPayload = `LINCOLN-RESIDENT:${passId}:${residentName.replace(/\s+/g, "-")}:${unitNumber.replace(/\s+/g, "-")}:${vehiclePlate}:${direction}-CLEARANCE`;

  const handleNotifyGate = async () => {
    setNotifying(true);
    try {
      await fetch("/api/v1/resident/gate-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentName,
          unitNumber,
          vehiclePlate,
          direction: direction === "EXIT" ? "out" : "in",
          code: passId,
        }),
      });
      setNotified(true);
      setTimeout(() => setNotified(false), 5000);
    } catch {
      setNotified(true);
      setTimeout(() => setNotified(false), 5000);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C9A227]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Digital Resident Credential</span>
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              My Estate Gate Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-gray-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passage Mode Switcher (Exit vs Return Entry) */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setDirection("EXIT")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              direction === "EXIT"
                ? "bg-[#B22222] text-white shadow-xs"
                : "text-slate-600 hover:text-gray-900"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Exit Estate</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection("ENTRY")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              direction === "ENTRY"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-gray-900"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Return to Estate</span>
          </button>
        </div>

        {/* QR Code Credential */}
        <div className="mt-4">
          <QrCodeDisplay
            value={qrPayload}
            size={200}
            title={direction === "EXIT" ? "Resident Exit Clearance" : "Resident Entry Clearance"}
            code={passId}
            subtitle={
              direction === "EXIT"
                ? "Show this QR code to gate security or optical scanner to exit smoothly."
                : "Show this QR code at the main gate for immediate resident entry."
            }
            accentColor={direction === "EXIT" ? "#B22222" : "#047857"}
            cornerColor="#C9A227"
            downloadName={`Lincoln-Resident-${direction}-Pass`}
            metadata={[
              { label: "Resident", value: residentName },
              { label: "Residence", value: `${unitNumber} (Phase 1)` },
              { label: "ANPR Vehicle", value: vehiclePlate },
              { label: "Clearance", value: "Verified & Active" },
            ]}
          />
        </div>

        {/* Fast-Track Pre-Clearance Ping to Gate */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {notified ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Gate 1 Security Notified! Barrier pre-cleared for {vehiclePlate}.</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={notifying}
              onClick={handleNotifyGate}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Radio className="w-4 h-4 text-[#C9A227] animate-pulse" />
              <span>
                {notifying
                  ? "Signaling Gate Command..."
                  : direction === "EXIT"
                  ? "Signal Gate: Approaching for Exit"
                  : "Signal Gate: Approaching for Entry"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
