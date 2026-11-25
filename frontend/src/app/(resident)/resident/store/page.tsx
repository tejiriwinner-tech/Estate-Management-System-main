"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ShoppingBag, Search, PackageCheck, MessageSquare, X, CheckCircle2, Store } from "lucide-react";
import { readSession } from "@/components/auth/session";

interface StoreProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
}

interface ResidentOrder {
  id: number;
  order_no: string;
  product_name: string;
  quantity: number;
  total_naira: number;
  delivery_comment: string;
  status: string;
}

export default function ResidentMarketplacePage() {
  const session = readSession();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<ResidentOrder[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Order Modal
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("Villa A-402");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/v1/store/products", { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/v1/store/orders${session?.email ? `?email=${encodeURIComponent(session.email)}` : ""}`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setProducts(pRes?.data || []);
      setOrders(oRes?.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session?.email]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const q = search.trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selected.id,
          product_name: selected.name,
          quantity: qty,
          unit_price: selected.price,
          resident_name: session?.name || "Estate Resident",
          resident_email: session?.email || "resident@lincolnestate.ng",
          unit_number: unit,
          delivery_comment: comment.trim(),
        }),
      });
      const json = await res.json();
      setToast(json.message || "Order placed!");
      setTimeout(() => setToast(null), 5000);
      setSelected(null);
      setQty(1);
      setComment("");
      await loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B22222]">
            <Store className="w-4 h-4" />
            <span>Post Army House Estate Marketplace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Estate Stores &amp; Delivery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Order groceries, essentials, and supplies from verified estate stores with direct delivery instructions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B22222]"
          />
        </div>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              category === cat ? "bg-[#B22222] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* E-Commerce Product Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading store products…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-extrabold text-slate-800">
                  {p.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 leading-snug">{p.name}</h3>
                  {p.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#B22222]">₦{p.price.toLocaleString()}</span>
                    <span className={`text-[11px] font-bold ${p.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {p.stock > 0 ? `${p.stock} available` : "Out of stock"}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={p.stock <= 0}
                    onClick={() => {
                      setSelected(p);
                      setQty(1);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Place Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Recent Orders */}
      {orders.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#B22222]" />
            <h2 className="text-sm font-extrabold text-gray-900">My Store Orders</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-500 mr-2">{o.order_no}</span>
                  <strong className="text-gray-900">{o.quantity}x {o.product_name}</strong>
                  {o.delivery_comment && (
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#C9A227]" />
                      <span>Note: {o.delivery_comment}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <strong className="text-gray-900">₦{o.total_naira.toLocaleString()}</strong>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Place Order Modal with Delivery Comment */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Order {selected.name}</h3>
                <p className="text-xs text-slate-500">₦{selected.price.toLocaleString()} each</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrder} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selected.stock}
                    required
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Unit / Villa</label>
                  <input
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Comments / Instructions
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Deliver to Villa A-402 gate, call 0803... on arrival"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Amount</span>
                <strong className="text-base font-black text-[#B22222]">
                  ₦{(qty * selected.price).toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] disabled:opacity-50"
                >
                  {submitting ? "Placing Order…" : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
