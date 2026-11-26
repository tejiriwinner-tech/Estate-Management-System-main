"use client";

import React, { useState } from "react";
import { X, QrCode, ShieldCheck, ShieldAlert, Search, CheckCircle2, RotateCcw } from "lucide-react";

interface VerificationResult {
  valid: boolean;
  passType?: "RESIDENT" | "VISITOR";
  action?: string;
  code?: string;
  pin?: string;
  personName?: string;
  unit?: string;
  vehicle?: string;
  purpose?: string;
  status: string;
  message: string;
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function QrScannerModal({ isOpen, onClose, onVerified }: QrScannerModalProps) {
  const [inputCode, setInputCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault();
    const target = (overrideCode ?? inputCode).trim();
    if (!target) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/v1/security/verify-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: target }),
      });
      const json = await res.json();
      setResult(json);
      if (json.valid) {
        onVerified?.();
      }
    } catch {
      setResult({
        valid: false,
        status: "VERIFICATION ERROR",
        message: "Unable to reach Gate Clearance Server.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const reset = () => {
    setResult(null);
    setInputCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#C9A227] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Gate QR &amp; Pass Scanner</h3>
              <p className="text-[11px] text-slate-500">Verify visitor passes &amp; resident exit QR codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleVerify} className="mt-5 space-y-4">
            {/* Optical Scanner Focus Target */}
            <div className="p-6 rounded-2xl bg-slate-950 text-center relative overflow-hidden border border-slate-800">
              <div className="w-24 h-24 mx-auto rounded-2xl border-2 border-dashed border-[#C9A227]/70 flex items-center justify-center relative">
                <QrCode className="w-12 h-12 text-[#C9A227]" />
                <span className="absolute inset-x-1 top-1/2 h-0.5 bg-red-500/80 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white mt-3">Ready for Optical QR Scan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scan QR code with handheld reader or enter Gate Code below
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                QR Payload or Gate Clearance Code
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. PAHE-8403 or PAHE-RESIDENT:..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Only active passes issued by verified Post Army Housing Estate residents will be granted clearance.
            </p>

            <button
              type="submit"
              disabled={verifying || !inputCode.trim()}
              className="w-full py-3 rounded-xl bg-[#B22222] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {verifying ? "Verifying Clearance..." : "Verify & Log Gate Passage"}
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div
              className={`p-5 rounded-2xl border-2 text-center ${
                result.valid
                  ? "bg-emerald-50/70 border-emerald-300"
                  : "bg-red-50/70 border-red-300"
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-white shadow-xs">
                {result.valid ? (
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-red-600" />
                )}
              </div>

              <div
                className={`text-sm font-black uppercase tracking-wider ${
                  result.valid ? "text-emerald-800" : "text-red-800"
                }`}
              >
                {result.status}
              </div>
              <p className="text-xs font-medium text-slate-700 mt-1">{result.message}</p>

              {result.valid && (
                <div className="mt-4 p-3 rounded-xl bg-white border border-emerald-200/80 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Type:</span>
                    <span className="font-bold text-slate-900">{result.action || result.passType}</span>
                  </div>
                  {result.personName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Person:</span>
                      <span className="font-bold text-slate-900">{result.personName}</span>
                    </div>
                  )}
                  {result.unit && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Unit:</span>
                      <span className="font-bold text-slate-900">{result.unit}</span>
                    </div>
                  )}
                  {result.vehicle && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">ANPR Plate:</span>
                      <span className="font-mono font-bold text-slate-900">{result.vehicle}</span>
                    </div>
                  )}
                  {result.code && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Clearance Code:</span>
                      <span className="font-mono font-bold text-[#B22222]">{result.code}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Scan Next</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
