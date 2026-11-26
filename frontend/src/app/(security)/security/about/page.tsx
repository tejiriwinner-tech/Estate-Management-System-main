"use client";

import React from "react";
import { Shield, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { DispatchContactsCard } from "@/components/security/DispatchContactsCard";
import { EMERGENCY_CODE_LIST } from "@/lib/emergencyCodes";

export default function SecurityAboutPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B22222] text-white shadow-sm">
            <Shield className="h-6 w-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Security Command &amp; Operations Guide</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Standard Operating Procedures (SOP), Emergency Protocol Codes, and Gate Post Orders for Post Army Housing Estate.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Protocol Codes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-extrabold text-slate-900">Emergency Response Protocols</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EMERGENCY_CODE_LIST.map((p) => (
            <div key={p.key} className={`p-4 rounded-xl border flex flex-col gap-1.5 ${p.cardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${p.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dotClass}`} />
                  {p.label}
                </span>
                <span className="text-[11px] font-bold text-slate-500">{p.priority}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-1">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.protocol}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Duty Contacts & Gate Post Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DispatchContactsCard editable />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-[#B22222]" />
              <h2 className="text-base font-extrabold text-slate-900">Gate Post Orders &amp; Access Mandates</h2>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>All visiting vehicles must have active QR pass verification or manual clearance logged into Access Control.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>No courier or third-party vehicle is permitted after 10:00 PM without resident dispatch approval.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Restricted entities on the Blacklist must be immediately detained at the boom barrier.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
