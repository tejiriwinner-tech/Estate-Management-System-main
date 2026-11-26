"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Ban,
  CheckCircle2,
  KeyRound,
  PlaneTakeoff,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import StatCard from "@/components/security/dashboard/StatCard";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

interface EmergencyItem {
  id: number;
  source: string;
  message: string;
  location: string;
  status: string;
  created_at?: string;
}

interface AccessLogItem {
  id: number;
  person: string;
  gate: string;
  direction: string;
  status: string;
  reason: string;
  time: string;
}

interface ActivePassItem {
  id: number;
  guest_name: string;
  invited_by: string;
  purpose: string;
  code: string;
  valid_until?: string;
}

interface DashboardData {
  stats: {
    intelligence: number;
    threats: number;
    activities: number;
    activePasses?: number;
    activeAway?: number;
  };
  openThreats: number;
  activeEmergencies?: EmergencyItem[];
  recentAccessLogs?: AccessLogItem[];
  activePasses?: ActivePassItem[];
  update: { author: string; role: string; timestamp: string; body: string } | null;
}

export default function DashboardPage() {
  const { data, error, reload } = useSecurityData<DashboardData>("/security/dashboard", {
    stats: { intelligence: 0, threats: 0, activities: 0, activePasses: 0, activeAway: 0 },
    openThreats: 0,
    activeEmergencies: [],
    recentAccessLogs: [],
    activePasses: [],
    update: null,
  });

  // Auto-poll every 5 seconds for instant SOS emergency alerts & newly issued passes
  useEffect(() => {
    const timer = setInterval(() => {
      void reload();
    }, 5000);
    return () => clearInterval(timer);
  }, [reload]);

  const [searchQuery, setSearchQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<{
    valid: boolean;
    title: string;
    subtitle: string;
    unit: string;
    status: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent, overrideCode?: string) => {
    e.preventDefault();
    const target = (overrideCode ?? searchQuery).trim();
    if (!target) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/v1/security/verify-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: target }),
      });
      const json = await res.json();
      setVerifiedResult({
        valid: Boolean(json.valid),
        title: json.personName ? `${json.personName} (${json.code || target})` : target,
        subtitle: json.message || "Verification complete",
        unit: json.unit || "Post Army Housing Estate",
        status: json.status || (json.valid ? "CLEARANCE GRANTED" : "ACCESS DENIED"),
      });
      void reload();
    } catch {
      setVerifiedResult({
        valid: false,
        title: target,
        subtitle: "Unable to reach Gate Verification Server.",
        unit: "—",
        status: "ERROR",
      });
    } finally {
      setVerifying(false);
    }
  };

  const resolveEmergency = async (item: EmergencyItem) => {
    await fetch("/api/v1/security/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, source: item.source }),
    }).catch(() => {});
    void reload();
  };

  const emergencies = data.activeEmergencies || [];
  const logs = data.recentAccessLogs || [];
  const passes = data.activePasses || [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <SecurityError message={error} />

      {/* Top Command Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-white via-white to-red-50/40 p-6 border border-gray-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#B22222]">
            <span className="w-2 h-2 rounded-full bg-[#B22222]" />
            <span>Post Army Housing Estate • Tactical Security Command</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-gray-900 tracking-tight">
            Security HQ Central Dashboard
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Condition:{" "}
            <strong className={data.openThreats > 0 ? "text-[#B22222]" : "text-emerald-700"}>
              {data.openThreats > 0 ? `ALERT (${data.openThreats} Active SOS)` : "Normal Operations"}
            </strong>{" "}
            • Auto-refreshing every 5s
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Sync</span>
          </button>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
              data.openThreats > 0
                ? "bg-red-50 border-red-200 text-[#B22222]"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                data.openThreats > 0 ? "bg-[#B22222]" : "bg-emerald-500"
              }`}
            />
            <span>{data.openThreats > 0 ? `${data.openThreats} Emergency Active` : "Perimeter Secure"}</span>
          </div>
        </div>
      </div>

      {/* Live Emergency SOS Alerts Panel (Instant Notification across Resident / Store / Agent / Admin) */}
      {emergencies.length > 0 && (
        <div className="rounded-2xl border-2 border-[#B22222] bg-red-50 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#B22222] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>Active Emergency / SOS Alerts ({emergencies.length})</span>
            </h3>
            <Link href="/security/emergency" className="text-xs font-bold text-[#B22222] hover:underline">
              Open Emergency Desk →
            </Link>
          </div>
          <div className="space-y-2">
            {emergencies.map((em) => (
              <div
                key={`${em.source}-${em.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white border border-red-200 p-4"
              >
                <div>
                  <p className="text-xs font-black text-gray-900">{em.message}</p>
                  <p className="text-xs font-semibold text-[#B22222] mt-0.5">Location: {em.location}</p>
                  {em.created_at && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Triggered at {new Date(em.created_at).toLocaleString("en-NG")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => resolveEmergency(em)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledge &amp; Resolve</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Live Tactical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active SOS Alerts"
          value={data.openThreats}
          icon={data.openThreats > 0 ? ShieldAlert : ShieldCheck}
          subtext={data.openThreats > 0 ? "Immediate response required" : "No active emergencies"}
          statusBadge={{ text: data.openThreats > 0 ? "Alert" : "Normal", variant: data.openThreats > 0 ? "red" : "green" }}
        />
        <StatCard
          label="Active Visitor Passes"
          value={data.stats.activePasses ?? passes.length}
          icon={KeyRound}
          subtext="Issued by estate residents"
          statusBadge={{ text: "Live Queue", variant: "blue" }}
        />
        <StatCard
          label="Gate Clearance Logs"
          value={data.stats.activities}
          icon={Activity}
          subtext="Verified entries & exits"
          statusBadge={{ text: "Real-Time", variant: "gold" }}
        />
        <StatCard
          label="Active Away Notices"
          value={data.stats.activeAway ?? 0}
          icon={PlaneTakeoff}
          subtext="Units under extra patrol"
          statusBadge={{ text: "Monitored", variant: "green" }}
        />
      </div>

      {/* Instant Gate Pass & QR Verification Console */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#B22222]" />
              <span>Instant Gate Pass &amp; QR Verification Console</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter or scan a Resident-issued Gate Pass code (e.g. PAHE-1234) or Resident Digital QR token
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Live DB Verification</span>
        </div>

        <form onSubmit={(e) => handleVerify(e)} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Visitor Pass Code (PAHE-XXXX) or scan Resident QR..."
              className="w-full rounded-xl border border-gray-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B22222] font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="flex items-center gap-1.5 rounded-xl bg-[#B22222] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#991B1B] transition-colors disabled:opacity-60 cursor-pointer"
          >
            <span>{verifying ? "Verifying..." : "Verify Access"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {verifiedResult && (
          <div
            className={`mt-4 rounded-xl p-4 border text-xs ${
              verifiedResult.valid
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-red-50/70 border-red-200 text-red-950"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-extrabold text-sm">{verifiedResult.title}</span>
                <p className="font-semibold text-slate-700 mt-0.5">{verifiedResult.subtitle}</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  <strong>Host / Unit:</strong> {verifiedResult.unit}
                </p>
              </div>
              <span
                className={`font-mono text-[10px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                  verifiedResult.valid
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-red-600 text-white border-red-700"
                }`}
              >
                {verifiedResult.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Grid: Active Visitor Passes Queue + Live Gate Clearance Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Resident-Issued Visitor Passes (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Active Resident Visitor Passes
              </h3>
              <p className="text-xs text-slate-500">Pre-authorized guests awaiting arrival</p>
            </div>
            <span className="text-xs font-bold text-[#B22222]">{passes.length} active</span>
          </div>

          {passes.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <UserCheck className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No active visitor passes</p>
              <p className="text-[11px] text-slate-400">Passes created by residents appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {passes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{p.guest_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Host: {p.invited_by} • {p.purpose}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      setSearchQuery(p.code);
                      void handleVerify(e, p.code);
                    }}
                    className="shrink-0 rounded-lg bg-[#1A1A1A] hover:bg-[#B22222] px-3 py-1.5 font-mono text-[11px] font-bold text-white transition-colors cursor-pointer"
                  >
                    Verify {p.code}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Gate Clearance Logs (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Live Gate Clearance Feed
              </h3>
              <p className="text-xs text-slate-500">Real-time QR verifications &amp; gate entries</p>
            </div>
            <Link href="/security/access" className="text-xs font-bold text-[#B22222] hover:underline">
              All Checkpoints →
            </Link>
          </div>

          {logs.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <Ban className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No gate clearances recorded yet</p>
              <p className="text-[11px] text-slate-400">Verified QR scans and visitor clearances will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{log.person}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {log.gate} • {log.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        log.status === "Access Denied"
                          ? "bg-red-50 text-[#B22222]"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {log.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
