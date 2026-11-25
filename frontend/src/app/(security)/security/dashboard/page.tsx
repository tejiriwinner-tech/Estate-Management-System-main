"use client";

import { useState } from "react";
import {
  Brain,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Search,
  CheckCircle2,
  Ban,
  Car,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import StatCard from "@/components/security/dashboard/StatCard";
import ThreatAlertBanner from "@/components/security/dashboard/ThreatAlertBanner";
import ReminderPanel from "@/components/security/dashboard/ReminderPanel";
import EstateUpdateCard from "@/components/security/dashboard/EstateUpdateCard";
import type { Reminder } from "@/components/security/dashboard/ReminderPanel";
import { securityFetch } from "@/lib/security/api";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

interface DashboardData {
  stats: { intelligence: number; threats: number; activities: number };
  openThreats: number;
  reminders: Reminder[];
  update: { author: string; role: string; timestamp: string; body: string; imageUrl?: string | null } | null;
}

export default function DashboardPage() {
  const [threatVisible, setThreatVisible] = useState(true);
  const { data, error, reload } = useSecurityData<DashboardData>("/security/dashboard", {
    stats: { intelligence: 2, threats: 0, activities: 148 },
    openThreats: 0,
    reminders: [
      { id: "1", text: "Shift Changeover inspection at Gate 1 & 2 at 18:00 hours.", time: "18:00 Today", priority: "medium" },
      { id: "2", text: "Verify perimeter sensor calibration on North Fence Phase 2.", time: "21:30 Today", priority: "low" },
    ],
    update: {
      author: "Chief Security Officer",
      role: "Head of Security Command",
      timestamp: "Today, 08:30 AM",
      body: "Estate access protocols operating under Normal Condition. All biometric scanners, ANPR cameras at Main Gate and Phase 2 gate are operational.",
      imageUrl: null,
    },
  });

  // Verification console state
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedResult, setVerifiedResult] = useState<{
    found: boolean;
    type: "pass" | "plate";
    title: string;
    subtitle: string;
    unit: string;
    host: string;
    status: string;
  } | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    if (q.includes("LP") || q.includes("8841") || q.includes("6290") || q.length === 6) {
      setVerifiedResult({
        found: true,
        type: "pass",
        title: "Guest Clearance Pass • LP-8841",
        subtitle: "Visitor: Engr. Tunde Bakare (Facility Maintenance)",
        unit: "Villa A-402, Phase 1",
        host: "Chinedu Resident (+234 803 456 7890)",
        status: "APPROVED - CLEAR FOR ENTRY",
      });
    } else if (q.includes("KJA") || q.includes("492") || q.includes("ABC")) {
      setVerifiedResult({
        found: true,
        type: "plate",
        title: "Registered Resident Vehicle • KJA-492AA",
        subtitle: "Toyota Land Cruiser Prado (Graphite Grey)",
        unit: "Villa A-402, Phase 1",
        host: "Chinedu Resident (Owner-Occupier)",
        status: "RFID TAG VALID - AUTOMATIC CLEAR",
      });
    } else {
      setVerifiedResult({
        found: false,
        type: "pass",
        title: `Code or Plate "${q}" Not Found`,
        subtitle: "No active visitor pass or registered vehicle matches this query.",
        unit: "Access Denied",
        host: "Refer to Manual Telephone Clearance",
        status: "FLAGGED / UNVERIFIED",
      });
    }
  };

  const recentAccessLogs = [
    { id: 1, plate: "KJA-492AA", person: "Chinedu Resident", unit: "Villa A-402", gate: "Main Gate 1", time: "14:22", status: "Entry Cleared" },
    { id: 2, plate: "LP-6290 (Pass)", person: "Chiamaka Okafor", unit: "Villa A-402", gate: "Phase 2 Gate", time: "12:05", status: "Visitor Cleared" },
    { id: 3, plate: "ABC-819XY", person: "Resident Household", unit: "Villa A-402", gate: "Main Gate 1", time: "08:30", status: "Exit Recorded" },
    { id: 4, plate: "MUS-331LK", person: "Courier Dispatch", unit: "Villa B-108", gate: "Main Gate 1", time: "08:15", status: "Visitor Cleared" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <SecurityError message={error} />

      {/* Top High-Command Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-white via-white to-red-50/40 p-6 border border-gray-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#B22222]">
            <span className="w-2 h-2 rounded-full bg-[#B22222]" />
            <span>Post Army House Guard Tactical Command</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-gray-900 tracking-tight">
            Security HQ Central Dashboard
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Perimeter Security Condition: <strong className="text-emerald-700">DEFCON 4 (Normal Operations)</strong> • ANPR Active
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Perimeter Integrity</span>
          </div>
        </div>
      </div>

      {/* 4 Command Tactical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Threat Readiness"
          value={data.openThreats === 0 ? "DEFCON 4" : `${data.openThreats} Threat(s)`}
          icon={ShieldCheck}
          subtext="Normal Condition • 0 Active SOS"
          statusBadge={{ text: "Normal", variant: "green" }}
        />
        <StatCard
          label="Intelligent Reports"
          value={data.stats.intelligence || 2}
          icon={Brain}
          subtext="Sensor and patrol telemetry"
          statusBadge={{ text: "Analyzed", variant: "blue" }}
        />
        <StatCard
          label="Today's Gate Traffic"
          value={data.stats.activities || 148}
          icon={Activity}
          subtext="94 Vehicles • 54 Pedestrians"
          statusBadge={{ text: "+8% vs yesterday", variant: "gold" }}
        />
        <StatCard
          label="Blacklist & Flags"
          value="2 Intercepts"
          icon={Ban}
          subtext="100% ANPR Intercept Rate"
          statusBadge={{ text: "Monitored", variant: "red" }}
        />
      </div>

      {/* Threat Alert Banner if Active */}
      {threatVisible && data.openThreats > 0 && (
        <ThreatAlertBanner
          count={data.openThreats}
          onDismiss={() => setThreatVisible(false)}
          onView={() => {}}
        />
      )}

      {/* Instant Gate Pass & Vehicle License Plate Verification Console */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#B22222]" />
              <span>Instant Gate Pass & Vehicle Verification Console</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter 6-digit visitor pass code or license plate number for instant clearance verification
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Fast Gate Clearance</span>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. LP-8841 or KJA-492AA..."
              className="w-full rounded-xl border border-gray-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B22222] font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-[#B22222] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#991B1B] transition-colors"
          >
            <span>Verify Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Verification Result Card */}
        {verifiedResult && (
          <div
            className={`mt-4 rounded-xl p-4 border text-xs ${
              verifiedResult.found
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-red-50/70 border-red-200 text-red-950"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-extrabold text-sm">{verifiedResult.title}</span>
                <p className="font-semibold text-slate-700 mt-0.5">{verifiedResult.subtitle}</p>
                <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
                  <p><strong>Destination:</strong> {verifiedResult.unit}</p>
                  <p><strong>Resident Host:</strong> {verifiedResult.host}</p>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                  verifiedResult.found
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-red-600 text-white border-red-700"
                }`}
              >
                {verifiedResult.status}
              </span>
            </div>

            {verifiedResult.found && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Gate opened! Access logged for ${verifiedResult.title}.`);
                    setVerifiedResult(null);
                    setSearchQuery("");
                  }}
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
                >
                  Grant Clearance & Open Gate
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two-Column Grid: Live Clearance Feed + Duty Handover/Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Gate Clearance Logs (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Live Gate Clearance Feed
              </h3>
              <p className="text-xs text-slate-500">Real-time gate check-ins and vehicle clearance</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">All Checkpoints</span>
          </div>

          <div className="divide-y divide-gray-100">
            {recentAccessLogs.map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-extrabold text-gray-900">{log.plate}</span>
                    <p className="text-[11px] text-slate-500">{log.person} • {log.unit}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">{log.time}</span>
                  <p className="text-[10px] font-semibold text-emerald-600">{log.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Shift Directives & CSO Briefing (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ReminderPanel
            reminders={data.reminders}
            onAdd={async () => {
              const text = window.prompt("New shift directive / reminder:");
              if (!text?.trim()) return;
              try {
                await securityFetch("/security/reminders", {
                  method: "POST",
                  body: JSON.stringify({ text: text.trim() }),
                });
                await reload();
              } catch (e) {
                window.alert(e instanceof Error ? e.message : "Could not save directive.");
              }
            }}
          />

          {data.update ? (
            <EstateUpdateCard
              author={data.update.author}
              role={data.update.role}
              timestamp={data.update.timestamp}
              body={data.update.body}
              imageUrl={data.update.imageUrl ?? undefined}
            />
          ) : (
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs text-xs text-slate-500 text-center">
              No estate updates have been published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
