"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Plus,
  CheckCircle2,
  Truck,
  Clock,
  Store,
  Upload,
  X,
  CreditCard,
} from "lucide-react";
import { StorePortalShell } from "@/components/store/StorePortalShell";
import { ResidentServiceChargePanel } from "@/components/resident/ResidentServiceChargePanel";

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

interface StoreOrder {
  id: number;
  order_no: string;
  product_name: string;
  quantity: number;
  total_naira: number;
  resident_name: string;
  unit_number: string;
  delivery_comment: string;
  status: string;
}

export default function StoreDashboard() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Groceries",
    price: "",
    stock: "10",
    description: "",
    image: "",
  });

  const load = useCallback(async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/v1/store/products", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/v1/store/orders", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setProducts(Array.isArray(pRes?.data) ? pRes.data : []);
      setOrders(Array.isArray(oRes?.data) ? oRes.data : []);
    } catch {
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          description: form.description.trim(),
          image: form.image || undefined,
        }),
      });
      if (res.ok) {
        setToast(`"${form.name}" added to your storefront catalog.`);
        setTimeout(() => setToast(null), 4000);
        setForm({ name: "", category: "Groceries", price: "", stock: "10", description: "", image: "" });
        setAddOpen(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const advanceOrder = async (order: StoreOrder) => {
    const flow = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
    const next = flow[Math.min(flow.length - 1, flow.indexOf(order.status) + 1)];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    await fetch("/api/v1/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: next }),
    }).catch(() => {});
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_naira || 0), 0);
  const pendingOrders = orders.filter((o) => o.status !== "Delivered").length;

  return (
    <StorePortalShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B22222]">
              <Store className="w-4 h-4" />
              <span>Post Army House Estate Marketplace</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Store Owner Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload products with pricing and stock, manage resident orders, and track shop service charges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/store-app/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800"
            >
              <ShoppingBag className="w-4 h-4 text-[#B22222]" />
              <span>Manage Orders</span>
            </Link>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Product</span>
            </button>
          </div>
        </div>

        {toast && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* E-Commerce KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Store Revenue</span>
            <p className="text-2xl font-black text-slate-900 mt-1">₦{totalRevenue.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">From {orders.length} resident orders</span>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Fulfillment</span>
            <p className="text-2xl font-black text-[#B22222] mt-1">{pendingOrders}</p>
            <span className="text-[11px] text-slate-500">Orders awaiting delivery</span>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Catalog Products</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
            <span className="text-[11px] text-slate-500">Live in Resident Storefront</span>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stock Units</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {products.reduce((s, p) => s + Number(p.stock || 0), 0)}
            </p>
            <span className="text-[11px] text-slate-500">Available inventory</span>
          </div>
        </div>

        {/* Two-column E-Commerce Workspace: Orders + Product Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customer Orders */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Resident Customer Orders</h2>
                <p className="text-[11px] text-slate-500">Includes resident delivery instructions</p>
              </div>
              <Link href="/store-app/orders" className="text-xs font-bold text-[#B22222] hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
              <p className="py-8 text-center text-xs text-slate-400">Loading orders…</p>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No resident orders placed yet. Once residents order from your catalog, they will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-700">{o.order_no}</span>
                        <span className="font-bold text-[#B22222]">{o.unit_number}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {o.resident_name} — {o.quantity}x {o.product_name}
                      </p>
                      {o.delivery_comment && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          Note: &ldquo;{o.delivery_comment}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <strong className="text-xs font-black text-slate-900">
                        ₦{Number(o.total_naira).toLocaleString()}
                      </strong>
                      {o.status === "Delivered" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Delivered
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void advanceOrder(o)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B22222] hover:bg-[#8F1A1A] text-white text-[10px] font-bold"
                        >
                          {o.status === "Pending" ? (
                            <>
                              <Clock className="w-3 h-3" /> Accept &amp; Pack
                            </>
                          ) : o.status === "Preparing" ? (
                            <>
                              <Truck className="w-3 h-3" /> Dispatch
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Mark Delivered
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* E-Commerce Product Grid */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Storefront Product Catalog</h2>
                <p className="text-[11px] text-slate-500">Displayed to residents in e-commerce format</p>
              </div>
              <Link href="/store-app/products" className="text-xs font-bold text-[#B22222] hover:underline">
                Manage All
              </Link>
            </div>

            {loading ? (
              <p className="py-8 text-center text-xs text-slate-400">Loading catalog…</p>
            ) : products.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No products uploaded yet.</p>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col">
                    <div className="h-28 bg-slate-100 relative">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-slate-700">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-black text-[#B22222]">₦{p.price.toLocaleString()}</strong>
                        <span className="text-[11px] font-semibold text-emerald-700">{p.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commercial Shop Service Charges */}
        <ResidentServiceChargePanel scope="store" compact />

        {/* Upload Product Modal */}
        {addOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setAddOpen(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Upload Store Product</h3>
                <button type="button" onClick={() => setAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Fresh Farm Eggs (Crate)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold bg-white"
                    >
                      <option>Groceries</option>
                      <option>Pantry</option>
                      <option>Household</option>
                      <option>Pharmacy</option>
                      <option>Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (₦)</label>
                    <input
                      required
                      type="number"
                      min={50}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Picture</label>
                  <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#B22222] bg-slate-50 p-3.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#B22222]" />
                    <span>{form.image ? "Image Selected (Click to Change)" : "Upload Product Photo"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] disabled:opacity-50"
                  >
                    {saving ? "Uploading…" : "Publish Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StorePortalShell>
  );
}
