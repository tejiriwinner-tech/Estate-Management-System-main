"use client";

import React from "react";
import { Shield, PhoneCall, AlertTriangle, Radio, Clock, CheckCircle2, FileText, Lock } from "lucide-react";

export default function SecurityAboutPage() {
  const emergencyProtocols = [
    { code: "Code Red", name: "Armed Intrusion / Perimeter Breach", action: "Immediate gate lockdown, alert central police dispatch, activate siren." },
    { code: "Code Amber", name: "Medical Incident / Panic Alarm", action: "Dispatch roving paramedic unit to unit coordinates, open VIP gate for ambulance." },
    { code: "Code Blue", name: "Fire Outbreak / Electrical Hazard", action: "Engage estate water hydrant team, notify state fire service, evacuate sector." },
    { code: "Code Yellow", name: "Suspicious Loitering / Vehicle Tailgate", action: "Challenge subject, verify digital guest QR pass, log ANPR plate data." },
  ];

  const dutyOfficers = [
    { role: "Chief Security Officer (CSO)", contact: "+234 803 456 7890", desk: "HQ Command Room" },
    { role: "Gate 1 Supervisor (Main Boom Barrier)", contact: "+234 802 001 9911", desk: "Gate 1 Terminal" },
    { role: "Gate 2 Supervisor (Service / Logistics)", contact: "+234 802 001 9922", desk: "Gate 2 Terminal" },
    { role: "Mobile Roving Patrol 1", contact: "+234 802 001 9933", desk: "Phase 1 Patrol" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-emerald-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Security Command &amp; Operations Guide</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Standard Operating Procedures (SOP), Emergency Protocol Codes, and Gate Post Orders for Post Army House Estate.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Protocol Codes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Emergency Response Protocols</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyProtocols.map((p) => (
            <div key={p.code} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {p.code}
                </span>
                <span className="text-[11px] font-bold text-slate-400">Priority Level 1</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{p.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Duty Contacts & Gate Post Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PhoneCall className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Command Dispatch Contacts</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {dutyOfficers.map((o) => (
              <div key={o.role} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{o.role}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{o.desk}</p>
                </div>
                <a href={`tel:${o.contact}`} className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  {o.contact}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Gate Post Orders &amp; Access Mandates</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>All visiting vehicles must have active ANPR scans or manual clearance logged into Access Control.</span>
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
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Post Army House Estate Security Command Directive · Revision 2026.4
          </div>
        </div>
      </div>
    </div>
  );
}
