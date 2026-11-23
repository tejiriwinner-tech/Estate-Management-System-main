"use client";

import React from "react";
import { Home, User } from "lucide-react";
import { ResidentProfile } from "@/types/residentFinance";

interface ResidentProfileCardProps {
  profile: ResidentProfile;
}

export function ResidentProfileCard({ profile }: ResidentProfileCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Top Centered Avatar & Identity */}
      <div className="flex flex-col items-center text-center pt-2 pb-5">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-accent/20 mb-4">
          <User className="h-11 w-11 text-primary/70" />
        </div>

        <h2 className="text-lg font-extrabold tracking-tight text-dark">
          {profile.name}
        </h2>

        <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          <Home className="h-3.5 w-3.5 text-accent" />
          <span>{profile.unit}</span>
        </div>
      </div>

      {/* Bottom Details List */}
      <div className="space-y-3.5 border-t border-slate-100 pt-5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-400">Street</span>
          <span className="font-bold text-dark text-right">{profile.street}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-400">Phone</span>
          <span className="font-bold text-dark text-right">{profile.phone}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-400">Status</span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
            {profile.status}
          </span>
        </div>
      </div>
    </div>
  );
}
