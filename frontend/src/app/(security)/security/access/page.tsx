"use client";

import { useCallback, useEffect, useState } from "react";
import { securityFetch } from "@/lib/security/api";
import { Plus, X, QrCode, Download } from "lucide-react";
import LiveVerificationCard from "@/components/security/access/LiveVerificationCard";
import AccessAlertPanel from "@/components/security/access/AccessAlertPanel";
import GuestPassesPanel, { type GuestPass } from "@/components/security/access/GuestPassesPanel";
import AccessLogsTable, { type AccessLogRow } from "@/components/security/access/AccessLogsTable";
import { QrScannerModal } from "@/components/security/access/QrScannerModal";

interface AccessData {
  logs: AccessLogRow[];
  total: number;
  trafficBars: { height: number; active?: boolean }[];
  entriesLast12h: number;
  latestVerified: { name: string; role: string; verificationType: string; gate: string; time: string } | null;
  latestDenied: { name: string; time: string; reason: string; gate: string } | null;
  passes: GuestPass[];
}

export default function AccessControlPage() {
  const [data, setData] = useState<AccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pass, setPass] = useState({ name: "", invited_by: "", minutes: "" });
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gateFilter, setGateFilter] = useState("ALL");
  const [exportPeriod, setExportPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  function downloadAccessLogs(period: "daily" | "weekly" | "monthly") {
    const rows = (data?.logs ?? []).filter((l) => {
      const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
      const matchesGate = gateFilter === "ALL" || (l.gateNo && l.gateNo.includes(gateFilter));
      return matchesStatus && matchesGate;
    });
    const headers = ["Name", "Type", "Unit / Destination", "Gate", "Time", "Status"];
    const csvRows = rows.map((r: any) => [
      r.name || r.personName || "Guest",
      r.personType || r.type || "Visitor",
      r.unit || r.houseNo || "—",
      r.gateNo || r.gate || "Gate 1",
      r.time || r.timestamp || "Today",
      r.status || "Granted",
    ]);
    const csv = [headers, ...csvRows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `post-army-house-access-logs-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const load = useCallback(async () => {
    try { setData(await securityFetch<AccessData>("/security/access")); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load access data."); }
  }, []);
  useEffect(() => {
    void load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function createPass(e: React.FormEvent) {
    e.preventDefault();
    if (!pass.name.trim()) return;
    setSaving(true);
    try {
      await securityFetch("/security/access/passes", {
        method: "POST",
        body: JSON.stringify({
          name: pass.name.trim(),
          invited_by: pass.invited_by.trim() || undefined,
          expires_in_minutes: pass.minutes ? Number(pass.minutes) : undefined,
        }),
      });
      setPass({ name: "", invited_by: "", minutes: "" });
      setDrawerOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the pass.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 relative">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[--color-text]">Access Control Monitoring</h2>
          <p className="text-sm text-[--color-text-muted] mt-0.5">Live surveillance and entry authorisation management.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B22222] text-white text-xs font-bold hover:bg-[#991B1B] transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4" /> Scan / Verify QR Pass
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
              showFilters || statusFilter !== "ALL" || gateFilter !== "ALL"
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-[--color-border] text-[--color-text-muted] hover:bg-gray-50"
            }`}
          >
            Filters
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-[--color-border] bg-white px-2 py-1">
            <select
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value as "daily" | "weekly" | "monthly")}
              aria-label="Export period"
              className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              type="button"
              onClick={() => downloadAccessLogs(exportPeriod)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Logs
            </button>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Temporary Pass
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-4 p-3 bg-white border border-[--color-border] rounded-xl flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            {["ALL", "Granted", "Denied"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Gate:</span>
            {["ALL", "Gate 1", "Gate 2"].map((g) => (
              <button
                key={g}
                onClick={() => setGateFilter(g)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  gateFilter === g ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {(statusFilter !== "ALL" || gateFilter !== "ALL") && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setGateFilter("ALL");
              }}
              className="text-xs font-semibold text-rose-600 hover:underline ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Top 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.latestVerified ? (
          <LiveVerificationCard
            personName={data.latestVerified.name}
            personRole={data.latestVerified.role}
            verificationType={data.latestVerified.verificationType}
            gateLocation={data.latestVerified.gate}
            verified={true}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[--color-border] p-4 text-sm text-[--color-text-muted]">No verified entries recorded yet.</div>
        )}
        {data?.latestDenied ? (
          <AccessAlertPanel
            failedTime={data.latestDenied.time}
            failureReason={data.latestDenied.reason}
            failureDetail={`Recorded at ${data.latestDenied.gate}.`}
            flaggedSubject={data.latestDenied.name}
            trafficBars={data.trafficBars}
            totalEntries={data.entriesLast12h}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[--color-border] p-4 text-sm text-[--color-text-muted]">
            No failed verifications. {data ? `${data.entriesLast12h} entries in the last 12 hours.` : ""}
          </div>
        )}
        <GuestPassesPanel passes={data?.passes ?? []} onNewPass={() => setDrawerOpen(true)} />
      </div>

      {/* Logs table */}
      <AccessLogsTable
        rows={(data?.logs ?? []).filter((l) => {
          const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
          const matchesGate = gateFilter === "ALL" || (l.gateNo && l.gateNo.includes(gateFilter));
          return matchesStatus && matchesGate;
        })}
        total={data?.total ?? 0}
      />

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDrawerOpen(false)}>
          <form onSubmit={createPass} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm space-y-3 rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[--color-text]">New Temporary Pass</h3>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <input required value={pass.name} onChange={(e) => setPass({ ...pass, name: e.target.value })} placeholder="Guest name" className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm" />
            <input value={pass.invited_by} onChange={(e) => setPass({ ...pass, invited_by: e.target.value })} placeholder="Invited by (unit or resident)" className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm" />
            <input type="number" min={5} max={10080} value={pass.minutes} onChange={(e) => setPass({ ...pass, minutes: e.target.value })} placeholder="Expires in (minutes) - blank for one-time" className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm" />
            <button disabled={saving} className="w-full rounded-lg bg-[--color-primary] py-2.5 text-sm font-bold text-white disabled:opacity-60">Create pass</button>
          </form>
        </div>
      )}

      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onVerified={load}
      />
    </div>
  );
}
