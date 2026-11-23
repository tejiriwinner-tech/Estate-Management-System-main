"use client";

import { useState } from "react";
import { CheckCircle, QrCode, RefreshCw, Scan } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface Props {
  gate: string;
  residentName: string;
  residentId: string;
  lastEntryTime: string;
  lastEntryGate: string;
  isActive: boolean;
  clearanceLabel: string;
}

type ClearanceTab = "QR Clearance" | "Personal" | "House";

export default function IdentityClearancePanel({
  gate,
  residentName,
  residentId,
  lastEntryTime,
  lastEntryGate,
  isActive,
  clearanceLabel,
}: Props) {
  const [tab, setTab] = useState<ClearanceTab>("QR Clearance");
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col overflow-hidden max-w-sm mx-auto">
      {/* Title */}
      <div className="px-5 py-4 border-b border-[--color-border]">
        <h2 className="text-base font-bold text-[--color-text]">Access Control</h2>
        <p className="text-xs text-[--color-text-muted] mt-0.5">Verify your identity to proceed through {gate}</p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Face scan */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-[--color-primary]">
            <Scan className="w-12 h-12 text-[--color-primary-light]" />
            {/* Corner markers */}
            <div className="absolute inset-0 border-4 border-[--color-primary] rounded-full" />
            {/* Active scanning line */}
            {scanning && (
              <div className="absolute inset-x-0 h-0.5 bg-[--color-primary] animate-bounce top-1/2" />
            )}
            {/* Verified badge */}
            {verified && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[--color-success] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                <CheckCircle className="w-2.5 h-2.5" /> VERIFIED
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--color-success] animate-pulse" />
            <span className="text-[10px] font-bold text-[--color-text] uppercase tracking-wide">Active Scanning</span>
          </div>
          {verified && (
            <div className="text-center">
              <p className="text-sm font-bold text-[--color-text]">Identity Confirmed</p>
              <p className="text-xs text-[--color-text-muted]">{residentName} · {residentId}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border border-[--color-border] rounded-xl overflow-hidden">
          {(["QR Clearance", "Personal", "House"] as ClearanceTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold transition-colors",
                tab === t
                  ? "bg-[--color-primary] text-white"
                  : "bg-white text-[--color-text-muted] hover:bg-gray-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* QR Code panel */}
        {tab === "QR Clearance" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-[--color-text-muted] text-center">
              Use this code for quick entry at main residential gates.
            </p>
            {/* QR placeholder */}
            <div className="w-36 h-36 bg-[--color-bg] border-2 border-[--color-border] rounded-xl flex items-center justify-center">
              <QrCode className="w-20 h-20 text-[--color-text]" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[--color-primary] text-white text-xs font-semibold hover:bg-[--color-primary-dark] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh QR Code
            </button>
          </div>
        )}

        {tab === "Personal" && (
          <div className="text-center py-4">
            <p className="text-sm font-semibold text-[--color-text]">{residentName}</p>
            <p className="text-xs text-[--color-text-muted] mt-1">{residentId}</p>
          </div>
        )}

        {tab === "House" && (
          <div className="text-center py-4">
            <p className="text-sm font-semibold text-[--color-text]">{lastEntryGate}</p>
            <p className="text-xs text-[--color-text-muted] mt-1">Primary residence</p>
          </div>
        )}

        {/* Recent activity */}
        <div className="border-t border-[--color-border] pt-4">
          <p className="text-xs font-bold text-[--color-text] mb-3">Recent Activity</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[--color-bg] rounded-xl p-3">
              <p className="text-[10px] text-[--color-text-muted] uppercase font-semibold">Last Entry</p>
              <p className="text-lg font-black text-[--color-text] tabular-nums mt-0.5">{lastEntryTime}</p>
              <p className="text-[10px] text-[--color-text-muted]">{lastEntryGate}</p>
            </div>
            <div className="bg-[--color-bg] rounded-xl p-3">
              <p className="text-[10px] text-[--color-text-muted] uppercase font-semibold">Status</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-[--color-success]" />
                <span className="text-xs font-bold text-[--color-success]">ACTIVE</span>
              </div>
              <p className="text-[10px] text-[--color-text-muted] mt-0.5">{clearanceLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
