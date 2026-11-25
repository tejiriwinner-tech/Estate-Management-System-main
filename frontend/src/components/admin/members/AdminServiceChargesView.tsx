"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Receipt, Plus, Search, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { ServiceChargeModal, type ServiceChargeRecord } from "./ServiceChargeModal";

export function AdminServiceChargesView() {
  const [charges, setCharges] = useState<ServiceChargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Pending" | "Paid">("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/service-charges", { cache: "no-store" });
      const json = await res.json();
      setCharges(json.data || []);
    } catch {
      setCharges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMarkPaid = async (id: number) => {
    await fetch("/api/v1/admin/service-charges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Paid" }),
    }).catch(() => {});
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this service charge invoice?")) return;
    await fetch(`/api/v1/admin/service-charges?id=${id}`, { method: "DELETE" }).catch(() => {});
    await load();
  };

  const filtered = useMemo(() => {
    return charges.filter((c) => {
      const matchStatus = filter === "All" || c.status === filter;
      const q = search.trim().toLowerCase();
      const matchQuery =
        !q ||
        c.resident_name.toLowerCase().includes(q) ||
        c.unit_number.toLowerCase().includes(q) ||
        c.service_type.toLowerCase().includes(q) ||
        c.invoice_no.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [charges, filter, search]);

  const totalBilled = charges.reduce((s, c) => s + c.amount, 0);
  const totalPaid = charges.filter((c) => c.status === "Paid").reduce((s, c) => s + c.amount, 0);
  const totalPending = charges.filter((c) => c.status !== "Paid").reduce((s, c) => s + c.amount, 0);
  const rate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

  return (
    <div className="space-y-6 pb-8">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border/70 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Service Charges</span>
          <p className="text-2xl font-black text-dark mt-1">₦{totalBilled.toLocaleString()}</p>
          <span className="text-[11px] text-muted">{charges.length} invoices issued</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-border/70 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Collected (Paid)</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">₦{totalPaid.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Verified settlements</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-border/70 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Pending Dues</span>
          <p className="text-2xl font-black text-[#B22222] mt-1">₦{totalPending.toLocaleString()}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Awaiting resident clearance</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-border/70 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Compliance Rate</span>
          <p className="text-2xl font-black text-dark mt-1">{rate}%</p>
          <span className="text-[11px] text-muted">Across Phases 1–5</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-border/70 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/60 border-b border-border/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-dark flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#B22222]" />
              <span>Estate Service Charge Register</span>
            </h2>
            <p className="text-xs text-muted">All resident villa &amp; commercial shop service charge assessments</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search unit, resident, invoice…"
                className="pl-8 pr-3 py-2 rounded-xl border border-border bg-white text-xs font-medium"
              />
            </div>

            {(["All", "Pending", "Paid"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filter === s ? "bg-slate-900 text-white" : "bg-white border border-border text-slate-600"
                }`}
              >
                {s}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Bill All Units</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-border/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-5">Invoice</th>
                <th className="py-3 px-4">Resident / Merchant</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Service Assessment</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted">Loading service charges…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted">No service charges match this filter.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-600">{c.invoice_no}</td>
                    <td className="py-3.5 px-4 font-bold text-dark">{c.resident_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{c.unit_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-dark">{c.service_type}</div>
                      <div className="text-[11px] text-muted">{c.billing_cycle}{c.due_date ? ` • Due ${c.due_date}` : ""}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-dark">₦{c.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      {c.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {c.status !== "Paid" && (
                          <button
                            type="button"
                            onClick={() => void handleMarkPaid(c.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleDelete(c.id)}
                          className="p-1.5 rounded-lg border border-border text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceChargeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        member={null}
        onSaved={load}
      />
    </div>
  );
}
