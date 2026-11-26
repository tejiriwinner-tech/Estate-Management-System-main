"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  MapPin,
  Radio,
  Shield,
  ShieldCheck,
  Users,
  ArrowRight,
  RefreshCw,
  Crosshair,
  ExternalLink,
} from "lucide-react";
import ResidentAccessTable, { type ResidentRow } from "@/components/security/hq/ResidentAccessTable";
import { type IntelItem } from "@/components/security/hq/IntelFeedCard";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";
import { SecurityDispatchMap } from "@/components/security/SecurityDispatchMap";
import { parseCodedAlert } from "@/lib/emergencyCodes";

interface LiveEmergency {
  id: number;
  source: string;
  message: string;
  location: string;
  status: string;
  created_at: string;
}

interface HqData {
  alerts: any[];
  highPriorityCount: number;
  residents: ResidentRow[];
  intel: IntelItem[];
}

const ESTATE_SECTORS = [
  { name: "Gate 1 (Main Boom Barrier)", code: "G1" },
  { name: "Gate 2 (Service / Logistics)", code: "G2" },
  { name: "Residential Phase 1 (Villas)", code: "P1" },
  { name: "Residential Phase 2", code: "P2" },
  { name: "Commercial Plaza & Shops", code: "CP" },
  { name: "Estate Admin & Agent Hub", code: "HQ" },
];

export default function SecurityHQPage() {
  const { data, error, reload } = useSecurityData<HqData>("/security/hq", {
    alerts: [],
    highPriorityCount: 0,
    residents: [],
    intel: [],
  });
  const [liveEmergencies, setLiveEmergencies] = useState<LiveEmergency[]>([]);

  const loadLive = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/security/dashboard", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setLiveEmergencies(json?.data?.activeEmergencies || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadLive();
    const t = setInterval(loadLive, 5000);
    return () => clearInterval(t);
  }, [loadLive]);

  const handleResolve = async (em: LiveEmergency) => {
    await fetch("/api/v1/security/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: em.id, source: em.source, status: "resolved" }),
    });
    await loadLive();
    reload();
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <SecurityError message={error} />

      {/* Top Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#B22222] text-white flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Post Army Housing Estate — Security HQ
            </h2>
            <p className="text-xs text-slate-500">
              Central tactical oversight, live coded emergency dispatch, and resident clearance monitoring.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              void loadLive();
              reload();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link
            href="/security/emergency"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#991B1B] shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#C9A227]" /> Emergency Command
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>ACTIVE EMERGENCIES</span>
            <Radio className={`w-4 h-4 ${liveEmergencies.length > 0 ? "text-red-600 animate-pulse" : "text-slate-400"}`} />
          </div>
          <p className={`mt-2 text-2xl font-extrabold ${liveEmergencies.length > 0 ? "text-red-700" : "text-slate-900"}`}>
            {liveEmergencies.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Live coded alerts</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>MONITORED RESIDENTS</span>
            <Users className="w-4 h-4 text-[#B22222]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{data.residents.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified estate profiles</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>INTELLIGENCE ITEMS</span>
            <Brain className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{data.intel.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Field & resident reports</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>PERIMETER STATUS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className={`mt-2 text-xl font-extrabold ${liveEmergencies.length > 0 ? "text-red-700" : "text-emerald-700"}`}>
            {liveEmergencies.length > 0 ? "Alert Active" : "All Clear"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">6 sectors monitored</p>
        </div>
      </div>

      {/* Main 3-Col Command Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Emergency Command Center + Sector Matrix */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Emergency Command Center
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time coded distress signals with exact origin location and sender role.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                liveEmergencies.length > 0
                  ? "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {liveEmergencies.length} Active Alert{liveEmergencies.length === 1 ? "" : "s"}
              </span>
            </div>

            {liveEmergencies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">No Active Emergencies</p>
                <p className="text-xs text-slate-500 mt-1">
                  Coded alerts (Code Red, Amber, Blue, Yellow) from Residents, Shop Owners, Agents, or Admin appear here instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveEmergencies.map((em) => {
                  const parsed = parseCodedAlert(em.message);
                  return (
                    <div
                      key={`${em.source}-${em.id}`}
                      className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 ${parsed.spec.cardClass}`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${parsed.spec.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${parsed.spec.dotClass} animate-ping`} />
                            {parsed.spec.label}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {parsed.spec.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B22222] shrink-0" />
                          <span>Location: {em.location}</span>
                          <span className="text-slate-400">•</span>
                          <span>Sender: {parsed.sender} ({parsed.role})</span>
                        </p>
                        <p className="text-[11px] text-slate-600">{parsed.details}</p>
                        {parsed.gpsLat !== null && parsed.gpsLng !== null && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <Crosshair className="w-3 h-3" />
                              GPS: {parsed.gpsLat.toFixed(5)}, {parsed.gpsLng.toFixed(5)}
                            </span>
                            <a
                              href={`https://www.google.com/maps?q=${parsed.gpsLat},${parsed.gpsLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#B22222] px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-[#991B1B]"
                            >
                              <span>Pinpoint on Map</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => void handleResolve(em)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estate Sector Readiness Matrix */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Estate Sector Readiness
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ESTATE_SECTORS.map((sec) => {
                  const sectorAlert = liveEmergencies.find((e) =>
                    e.location.toLowerCase().includes(sec.name.split(" ")[0].toLowerCase()) ||
                    (sec.code === "CP" && e.location.toLowerCase().includes("shop"))
                  );
                  return (
                    <div
                      key={sec.code}
                      className={`rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2 ${
                        sectorAlert
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-slate-200 bg-slate-50/60 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {sec.code}
                        </p>
                        <p className="text-xs font-bold truncate">{sec.name}</p>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          sectorAlert ? "bg-red-600 animate-ping" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <SecurityDispatchMap alerts={liveEmergencies} />

          <ResidentAccessTable rows={data.residents} />
        </div>

        {/* Right Column: Live Intelligence Feed */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Intelligence Feed</h3>
              <Link
                href="/security/intelligence"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B22222] hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.intel.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                <Brain className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Intelligence Reports</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Patrol observations and resident threat intel will stream here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.intel.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-600 mt-1">{item.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
