"use client";

import { useCallback, useEffect, useState } from "react";
import { securityFetch } from "@/lib/security/api";
import { Download, MapPin, Radio, CheckCircle2, ShieldAlert, Clock, ExternalLink, Crosshair } from "lucide-react";
import EmergencyHistoryTable, { type HistoryRow } from "@/components/security/emergency/EmergencyHistoryTable";
import { CodedEmergencyTrigger } from "@/components/emergency/CodedEmergencyTrigger";
import { DispatchContactsCard } from "@/components/security/DispatchContactsCard";
import { EMERGENCY_CODE_LIST, parseCodedAlert, type EmergencyCodeKey } from "@/lib/emergencyCodes";

interface LiveEmergency {
  id: number;
  source: string;
  message: string;
  location: string;
  status: string;
  created_at: string;
}

interface EmergencyData {
  active: any[];
  history: HistoryRow[];
  total: number;
  contacts: { name: string; number: string }[];
}

export default function EmergencyAlertsPage() {
  const [data, setData] = useState<EmergencyData>({ active: [], history: [], total: 0, contacts: [] });
  const [liveAlerts, setLiveAlerts] = useState<LiveEmergency[]>([]);
  const [codeFilter, setCodeFilter] = useState<"ALL" | EmergencyCodeKey>("ALL");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [emRes, dashRes] = await Promise.all([
        securityFetch<EmergencyData>("/security/emergency").catch(() => ({
          active: [],
          history: [],
          total: 0,
          contacts: [],
        })),
        fetch("/api/v1/security/dashboard", { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => ({ data: { activeEmergencies: [] } })),
      ]);
      setData(emRes);
      setLiveAlerts(dashRes?.data?.activeEmergencies || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load alerts.");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  async function handleResolve(em: LiveEmergency) {
    try {
      await fetch("/api/v1/security/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: em.id, source: em.source, status: "resolved" }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve the alert.");
    }
  }

  function exportCsv() {
    const headers = ["Code", "Sender", "Role", "Location", "Details", "Status", "Time"];
    const rows = liveAlerts.map((em) => {
      const p = parseCodedAlert(em.message);
      return [
        p.spec.label,
        p.sender,
        p.role,
        em.location,
        p.details,
        em.status,
        em.created_at,
      ];
    });
    const csv = [headers, ...rows]
      .map((line) => line.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pahe-emergency-alerts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredAlerts = liveAlerts.filter((em) => {
    if (codeFilter === "ALL") return true;
    return parseCodedAlert(em.message).codeKey === codeFilter;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Emergency Alerts Command</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant coded distress notifications (Code Red, Amber, Blue, Yellow) from Residents, Shop Owners, Agents & Admin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" /> Export Log
          </button>
          <CodedEmergencyTrigger
            senderName="Security Command"
            senderRole="Admin"
            defaultLocation="Gate 1 Security Command"
            buttonLabel="Broadcast Coded Alert"
            compact
          />
        </div>
      </div>

      {/* Code Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCodeFilter("ALL")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition-colors ${
            codeFilter === "ALL"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Active ({liveAlerts.length})
        </button>
        {EMERGENCY_CODE_LIST.map((spec) => (
          <button
            key={spec.key}
            onClick={() => setCodeFilter(spec.key)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-colors ${
              codeFilter === spec.key
                ? "bg-[#B22222] text-white border-[#B22222]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${spec.dotClass}`} />
            {spec.shortLabel}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Active Emergencies */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${filteredAlerts.length > 0 ? "text-red-600 animate-pulse" : "text-slate-400"}`} />
                <h3 className="text-sm font-extrabold text-slate-900">Active Emergencies</h3>
              </div>
              {filteredAlerts.length > 0 && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  {filteredAlerts.length} URGENT
                </span>
              )}
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-10 text-center">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No active emergencies</p>
                <p className="text-xs text-slate-500 mt-1">
                  Auto-polling every 4 seconds for incoming Code Red, Amber, Blue, or Yellow alerts.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAlerts.map((em) => {
                  const parsed = parseCodedAlert(em.message);
                  return (
                    <div
                      key={`${em.source}-${em.id}`}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${parsed.spec.cardClass}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${parsed.spec.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${parsed.spec.dotClass} animate-ping`} />
                            {parsed.spec.label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(em.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-900">{parsed.spec.title}</p>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B22222] shrink-0" />
                          <span>{em.location}</span>
                        </p>
                        <p className="text-[11px] text-slate-600">
                          From: <strong>{parsed.sender}</strong> ({parsed.role})
                        </p>
                        <p className="text-[11px] text-slate-600 bg-white/70 rounded-lg p-2 border border-slate-200/70">
                          {parsed.details}
                        </p>
                        {parsed.gpsLat !== null && parsed.gpsLng !== null && (
                          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px]">
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                <Crosshair className="w-3 h-3" />
                                GPS: {parsed.gpsLat.toFixed(5)}, {parsed.gpsLng.toFixed(5)}
                                {parsed.gpsAccuracy ? ` (±${parsed.gpsAccuracy}m)` : ""}
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${parsed.gpsLat},${parsed.gpsLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-extrabold text-[#B22222] hover:underline"
                              >
                                <span>Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <iframe
                              title={`GPS Pin for ${em.location}`}
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${parsed.gpsLng - 0.004}%2C${parsed.gpsLat - 0.004}%2C${parsed.gpsLng + 0.004}%2C${parsed.gpsLat + 0.004}&layer=mapnik&marker=${parsed.gpsLat}%2C${parsed.gpsLng}`}
                              className="w-full h-36 border-0"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => void handleResolve(em)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-extrabold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatch &amp; Resolve
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <EmergencyHistoryTable rows={data.history} total={data.total} />
        </div>

        {/* Right Panel: Protocol Reference & Dispatch Contacts */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">
              PAHE Response Protocols
            </h3>
            <div className="space-y-2.5">
              {EMERGENCY_CODE_LIST.map((spec) => (
                <div key={spec.key} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${spec.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${spec.dotClass}`} />
                      {spec.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{spec.priority}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{spec.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{spec.protocol}</p>
                </div>
              ))}
            </div>
          </div>

          <DispatchContactsCard editable />
        </div>
      </div>
    </div>
  );
}
