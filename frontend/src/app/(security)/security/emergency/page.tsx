"use client";

import { useCallback, useEffect, useState } from "react";
import { securityFetch } from "@/lib/security/api";
import { Filter, Download, MapPin } from "lucide-react";
import ActiveAlertCard, { type ActiveAlertData } from "@/components/security/emergency/ActiveAlertCard";
import EmergencyHistoryTable, { type HistoryRow } from "@/components/security/emergency/EmergencyHistoryTable";
import EmergencyReportPanel from "@/components/security/emergency/EmergencyReportPanel";

interface EmergencyData {
  active: ActiveAlertData[];
  history: HistoryRow[];
  total: number;
  contacts: { name: string; number: string }[];
}

export default function EmergencyAlertsPage() {
  const [data, setData] = useState<EmergencyData>({ active: [], history: [], total: 0, contacts: [] });
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const alerts = data.active;

  const load = useCallback(async () => {
    try { setData(await securityFetch<EmergencyData>("/security/emergency")); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load alerts."); }
  }, []);
  useEffect(() => {
    void load();
    const t = setInterval(load, 10000); // new panic alerts show up within seconds
    return () => clearInterval(t);
  }, [load]);

  async function handleResolve(id: string) {
    try { await securityFetch(`/alerts/${id}/resolve`, { method: "POST" }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not resolve the alert."); }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[--color-text]">Emergency Alerts</h2>
          <p className="text-sm text-[--color-text-muted] mt-0.5">Real-time threat monitoring and incident response management.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[--color-border] text-xs font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter View
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[--color-border] text-xs font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Log
          </button>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: alerts + history */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Active emergencies */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-[--color-text]">🔴 Active Emergencies</span>
              {alerts.length > 0 && (
                <span className="bg-[--color-danger] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {alerts.length} URGENT
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <ActiveAlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolve}
                />
              ))}
              {alerts.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-[--color-text-muted] bg-white rounded-xl border border-[--color-border]">
                  No active emergencies.
                </div>
              )}
            </div>
          </div>

          {/* History table */}
          <EmergencyHistoryTable rows={data.history} total={data.total} />
        </div>

        {/* Right: report panel + tactical map toggle */}
        <div className="flex flex-col gap-5">
          <EmergencyReportPanel contacts={data.contacts} />

          {/* Live tactical map */}
          <div className="bg-white rounded-xl border border-[--color-border] overflow-hidden">
            <button
              onClick={() => setMapOpen((p) => !p)}
              className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[--color-primary]" />
                <span className="text-sm font-semibold text-[--color-text]">Live Tactical Map</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[--color-danger] animate-pulse" />
            </button>
            {mapOpen && (
              <div className="h-48 bg-gray-100 flex items-center justify-center border-t border-[--color-border]">
                <p className="text-xs text-[--color-text-subtle]">Map view — connect mapping service</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
