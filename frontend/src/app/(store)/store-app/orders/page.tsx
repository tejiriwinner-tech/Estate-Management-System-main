"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MessageSquareText,
  PackageCheck,
  Power,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { StorePortalShell, useStoreIdentity } from "@/components/store/StorePortalShell";

interface StoreOrder {
  id: number;
  order_no: string;
  product_id?: number;
  product_name: string;
  quantity: number;
  total_naira: number;
  resident_name: string;
  resident_email?: string;
  unit_number: string;
  delivery_comment: string;
  payment_method?: string;
  payment_reference?: string;
  payment_proof_url?: string | null;
  payment_proof_name?: string | null;
  status: string;
  created_at?: string;
}

const STATUS_TABS = ["All", "Pending", "Preparing", "Out for Delivery", "Delivered"] as const;

function OrdersControlContent() {
  const { store, toggleStoreOpen } = useStoreIdentity();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
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
    void loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = async (order: StoreOrder, nextStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    setNotice(`Order ${order.order_no} updated to ${nextStatus}.`);
    setTimeout(() => setNotice(""), 3500);
    await fetch("/api/v1/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: nextStatus }),
    }).catch(() => {});
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = filter === "All" || o.status === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.order_no.toLowerCase().includes(q) ||
        o.resident_name.toLowerCase().includes(q) ||
        o.unit_number.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [orders, filter, search]);

  const pendingCount = orders.filter((o) => o.status === "Pending" || o.status === "Preparing").length;
  const transitCount = orders.filter((o) => o.status === "Out for Delivery").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  const getNextAction = (status: string) => {
    switch (status) {
      case "Pending":
        return { label: "Start Preparing", next: "Preparing" };
      case "Preparing":
        return { label: "Dispatch Order", next: "Out for Delivery" };
      case "Out for Delivery":
        return { label: "Mark Delivered", next: "Delivered" };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B22222]">
            {store?.name || "Store Owner Hub"} • {store?.shop_unit || "Commercial Plaza"}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Orders &amp; Fulfillment Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track resident orders, read delivery instructions, and update dispatch status in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {store && (
            <button
              type="button"
              onClick={toggleStoreOpen}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold border transition-colors cursor-pointer ${
                store.isOpen
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{store.isOpen ? "Storefront Open" : "Storefront Paused"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadOrders}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Refresh</span>
          </button>
          <Link
            href="/store-app/products"
            className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] hover:bg-[#991b1b] px-4 py-2 text-xs font-extrabold text-white transition-colors"
          >
            <span>Manage Catalog</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 4 Live KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">All resident orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending &amp; Pack</p>
            <p className="text-2xl font-extrabold text-[#B22222] mt-1">{pendingCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B22222] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Out for Delivery</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{transitCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">In transit to unit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A227] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{deliveredCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Completed orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, resident, unit, or product..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B22222]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  filter === tab
                    ? "bg-[#B22222] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Order #</th>
                <th className="py-3.5 px-5">Resident &amp; Unit</th>
                <th className="py-3.5 px-5">Product &amp; Qty</th>
                <th className="py-3.5 px-5">Delivery Comment</th>
                <th className="py-3.5 px-5">Total</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading resident orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No orders found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Resident orders placed in the storefront will appear here in real time.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const action = getNextAction(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-5 font-mono font-bold text-[#B22222]">
                        {o.order_no}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900">{o.resident_name}</p>
                        <p className="text-[11px] text-slate-500">{o.unit_number}</p>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-slate-800">{o.product_name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {o.quantity}</p>
                      </td>
                      <td className="py-4 px-5 max-w-[220px]">
                        {o.delivery_comment ? (
                          <span className="inline-flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200/70 px-2.5 py-1 text-[11px] text-amber-900">
                            <MessageSquareText className="w-3 h-3 text-[#C9A227] shrink-0 mt-0.5" />
                            <span>{o.delivery_comment}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-extrabold text-slate-900">
                        <p>₦{o.total_naira.toLocaleString()}</p>
                        {o.payment_reference && (
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                            {o.payment_method || "Transfer"} • {o.payment_reference}
                          </p>
                        )}
                        {o.payment_proof_url && (
                          <a
                            href={o.payment_proof_url}
                            target="_blank"
                            rel="noreferrer"
                            download={o.payment_proof_name || `${o.order_no}-proof`}
                            className="inline-block text-[10px] font-bold text-[#B22222] hover:underline mt-0.5"
                          >
                            View Payment Proof →
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            o.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : o.status === "Out for Delivery"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {action ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(o, action.next)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] hover:bg-[#991b1b] px-3 py-1.5 text-[11px] font-bold text-white transition-colors cursor-pointer"
                          >
                            {action.label}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StoreOrdersPage() {
  return (
    <StorePortalShell>
      <OrdersControlContent />
    </StorePortalShell>
  );
}
