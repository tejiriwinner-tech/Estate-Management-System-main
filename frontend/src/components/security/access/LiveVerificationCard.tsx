"use client";

import { CheckCircle, Scan } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface Props {
  personName: string;
  personRole: string;
  matchScore?: number; // only when a biometric device reports one
  verificationType: string;
  gateLocation: string;
  verified: boolean;
}

export default function LiveVerificationCard({
  personName,
  personRole,
  matchScore,
  verificationType,
  gateLocation,
  verified,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[--color-success] animate-pulse" />
          <span className="text-xs font-bold text-[--color-text] uppercase tracking-wide">Live Verification</span>
        </div>
        {matchScore !== undefined && (
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            verified ? "bg-[--color-success-light] text-[--color-success]" : "bg-[--color-danger-light] text-[--color-danger]"
          )}>
            MATCH {matchScore}%
          </span>
        )}
      </div>

      {/* Face scan */}
      <div className="relative mx-auto w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {/* Scan overlay */}
        <div className="absolute inset-0 border-2 border-[--color-success] rounded-xl z-10" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[--color-success] rounded-tl-lg z-20" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[--color-success] rounded-tr-lg z-20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[--color-success] rounded-bl-lg z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[--color-success] rounded-br-lg z-20" />
        {/* Person silhouette placeholder */}
        <div className="w-16 h-16 rounded-full bg-[--color-primary-light] flex items-center justify-center">
          <Scan className="w-8 h-8 text-[--color-primary]" />
        </div>
        {/* Verified badge */}
        {verified && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[--color-success] text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-20 whitespace-nowrap">
            <CheckCircle className="w-2.5 h-2.5" /> {personName}
          </div>
        )}
      </div>

      {/* Person info */}
      <p className="text-xs text-center text-[--color-text-muted]">{personRole}</p>

      {/* Meta chips */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[--color-bg] rounded-lg px-3 py-2">
          <p className="text-[9px] text-[--color-text-subtle] uppercase font-semibold tracking-wide">Verification Type</p>
          <p className="text-xs font-bold text-[--color-text] mt-0.5">{verificationType}</p>
        </div>
        <div className="bg-[--color-bg] rounded-lg px-3 py-2">
          <p className="text-[9px] text-[--color-text-subtle] uppercase font-semibold tracking-wide">Gate Location</p>
          <p className="text-xs font-bold text-[--color-text] mt-0.5">{gateLocation}</p>
        </div>
      </div>
    </div>
  );
}
