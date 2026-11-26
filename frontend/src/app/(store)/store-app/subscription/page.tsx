"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Building2, CheckCircle2, Clock, CreditCard, Download, PackageCheck, Wallet } from "lucide-react";
import { StorePortalShell, useStoreIdentity } from "@/components/store/StorePortalShell";

interface StoreOrder {
  id: number;
  order_no: string;
  product_name: string;
  quantity: number;
  total_naira: number;
  resident_name: string;
  unit_number: string;
  status: string;
  created_at?: string;
}

function SettlementsContent() {
  const { store } = useStoreIdentity();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/store/orders", { cache: "no-store" });
      const json = await res.json();
      setOrders(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const settledTotal = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total_naira || 0), 0);
  const pendingTotal = orders
    .filter((o) => o.status !== "Delivered")
    .reduce((sum, o) => sum + Number(o.total_naira || 0), 0);
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  const exportCsv = () => {
    const headers = ["Order #", "Resident", "Unit", "Product", "Qty", "Amount (NGN)", "Status", "Date"];
    const rows = orders.map((o) => [
      o.order_no,
      o.resident_name,
      o.unit_number,
      o.product_name,
      String(o.quantity),
      String(o.total_naira),
      o.status,
      o.created_at ? new Date(o.created_at).toISOString().split("T")[0] : "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(store?.name || "store").toLowerCase().replace(/\s+/g, "-")}-settlements.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B22222]">
            {store?.name || "Store Owner Hub"} • {store?.shop_unit || "Commercial Plaza"}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Settlements &amp; Payouts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track settled resident order revenue and pending payouts for {store?.owner_name || "Store Admin"}.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#C9A227]" />
          <span>Export Settlement CSV</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Settled Revenue</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">₦{settledTotal.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Delivered orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Payouts</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">₦{pendingTotal.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting delivery completion</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A227] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered Orders</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{deliveredCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Eligible for payout</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payout Status</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1">
              {store?.isOpen !== false ? "Active Merchant" : "Paused"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Direct Estate Settlement</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B22222] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Settlement Ledger */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Order Settlement Ledger</h2>
            <p className="text-xs text-slate-400">Breakdown of resident purchases and fulfillment settlement status</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{orders.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Order #</th>
                <th className="py-3.5 px-6">Resident &amp; Unit</th>
                <th className="py-3.5 px-6">Item</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading settlements...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No settlements recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Completed resident orders will appear here for payout reconciliation.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-6 font-mono font-bold text-[#B22222]">{o.order_no}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{o.resident_name}</p>
                      <p className="text-[11px] text-slate-500">{o.unit_number}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {o.product_name} × {o.quantity}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">₦{o.total_naira.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {o.status === "Delivered" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                          <Clock className="w-3 h-3" /> Pending ({o.status})
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StoreAppSubscriptionPage() {
  return (
    <StorePortalShell>
      <SettlementsContent />
    </StorePortalShell>
  );
}
