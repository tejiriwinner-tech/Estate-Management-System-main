"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Filter, PackageCheck, Printer, Search, ShoppingBag, Truck } from "lucide-react";
import { StoreAvailabilityControl } from "../components/store-screens";

interface Order {
  id: string;
  residentName: string;
  unit: string;
  items: string[];
  total: number;
  date: string;
  time: string;
  status: "pending" | "processing" | "dispatched" | "delivered";
  paymentMethod: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-8820",
    residentName: "Chinedu Resident",
    unit: "Villa A-402",
    items: ["2x Nestlé Pure Life 1.5L (Pack)", "1x Golden Penny Bread", "1x Peak Full Cream Milk 400g"],
    total: 15500,
    date: "Today",
    time: "14:22 WAT",
    status: "processing",
    paymentMethod: "Paystack (Paid)",
  },
  {
    id: "ORD-8819",
    residentName: "Col. Bello Garba",
    unit: "Block C, Flat 12",
    items: ["1x Chivita Active Juice 1L", "2x Kellogg's Cornflakes 500g", "1x Kerrygold Butter"],
    total: 18200,
    date: "Today",
    time: "12:05 WAT",
    status: "dispatched",
    paymentMethod: "Paystack (Paid)",
  },
  {
    id: "ORD-8816",
    residentName: "Mrs. Amaka Peters",
    unit: "Duplex 7",
    items: ["5x Power Oil 1L", "1x Royal Stallion Rice 5kg", "2x Gino Tomato Paste 70g"],
    total: 34500,
    date: "Yesterday",
    time: "16:40 WAT",
    status: "delivered",
    paymentMethod: "Direct Transfer (Verified)",
  },
  {
    id: "ORD-8812",
    residentName: "Engr. Femi Adeleke",
    unit: "Villa B-101",
    items: ["1x Ariel Auto Washing Powder 2kg", "2x Harpic Toilet Cleaner 750ml", "1x Dettol Antiseptic 500ml"],
    total: 12800,
    date: "Nov 21, 2026",
    time: "09:15 WAT",
    status: "delivered",
    paymentMethod: "Paystack (Paid)",
  },
  {
    id: "ORD-8809",
    residentName: "Dr. Hadiza Mohammed",
    unit: "Penthouse 3",
    items: ["1x Lipton Yellow Label Tea (100 bags)", "3x Danone Greek Yoghurt", "1x Honey Naturel 500g"],
    total: 9400,
    date: "Nov 20, 2026",
    time: "18:30 WAT",
    status: "delivered",
    paymentMethod: "Paystack (Paid)",
  },
];

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const updateStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setNotice(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
    setTimeout(() => setNotice(""), 4000);
  };

  const filteredOrders = orders.filter((o) => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch =
      !search.trim() ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.residentName.toLowerCase().includes(search.toLowerCase()) ||
      o.unit.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "dispatched":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "delivered":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <Link href="/store-app" className="hover:text-dark hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-dark font-bold">Orders &amp; Dispatch</span>
          </div>
          <h1 className="text-2xl font-black text-dark tracking-tight mt-1 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#B22222]" />
            <span>Orders &amp; Fulfillment Control</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Monitor incoming resident grocery orders, prepare shipments, and confirm delivery within Lincoln Estate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/store-app/products"
            className="px-4 py-2 rounded-xl border border-border bg-white text-xs font-bold text-dark hover:bg-slate-50 transition-all shadow-xs"
          >
            Manage Catalog
          </Link>
          <Link
            href="/store-app"
            className="px-4 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] transition-all shadow-xs"
          >
            Dashboard Overview
          </Link>
        </div>
      </div>

      <StoreAvailabilityControl />

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice("")} className="text-sm font-bold text-emerald-900 hover:text-emerald-700">×</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Orders</span>
          <div className="text-2xl font-black text-dark mt-1">{orders.length}</div>
          <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">Across all estate units</span>
        </div>
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Processing &amp; Pack</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {orders.filter((o) => o.status === "processing").length}
          </div>
          <span className="text-[11px] font-semibold text-muted mt-0.5 block">Awaiting rider dispatch</span>
        </div>
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Out for Delivery</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {orders.filter((o) => o.status === "dispatched").length}
          </div>
          <span className="text-[11px] font-semibold text-muted mt-0.5 block">In transit to resident villa</span>
        </div>
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Fulfilled Today</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {orders.filter((o) => o.status === "delivered").length}
          </div>
          <span className="text-[11px] font-semibold text-muted mt-0.5 block">100% customer satisfaction</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-border/80 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, resident name, or villa unit..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-muted shrink-0 mr-1" />
            {[
              { id: "all", label: "All Orders" },
              { id: "processing", label: "Processing" },
              { id: "dispatched", label: "Dispatched" },
              { id: "delivered", label: "Delivered" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  filter === f.id
                    ? "bg-[#B22222] text-white shadow-xs"
                    : "bg-white border border-border text-slate-600 hover:text-dark hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100/70 border-b border-border text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Order ID &amp; Time</th>
                <th className="py-3 px-4">Resident &amp; Destination</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total &amp; Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-dark text-xs">{order.id}</div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{order.date} • {order.time}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-dark">{order.residentName}</div>
                      <div className="text-[11px] font-semibold text-[#B22222] mt-0.5">{order.unit}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <ul className="space-y-0.5">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="text-slate-700 text-[11px] truncate">• {it}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-dark">₦{order.total.toLocaleString()}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{order.paymentMethod}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${getStatusBadge(order.status)}`}>
                        {order.status === "processing" && <PackageCheck className="w-3 h-3" />}
                        {order.status === "dispatched" && <Truck className="w-3 h-3" />}
                        {order.status === "delivered" && <CheckCircle2 className="w-3 h-3" />}
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === "processing" && (
                          <button
                            onClick={() => updateStatus(order.id, "dispatched")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#B22222] text-white text-[11px] font-bold hover:bg-[#8F1A1A] transition-all shadow-2xs flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}
                        {order.status === "dispatched" && (
                          <button
                            onClick={() => updateStatus(order.id, "delivered")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Delivered</span>
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          title="Print Packing Slip"
                          className="p-1.5 rounded-lg border border-border text-slate-600 hover:text-dark hover:bg-slate-100 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
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
    </div>
  );
}
