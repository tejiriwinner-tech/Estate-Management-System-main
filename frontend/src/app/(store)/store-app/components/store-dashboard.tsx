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
  ArrowUpRight,
  MapPin,
  UserCheck,
  Power,
  Boxes,
  MessageSquareText,
} from "lucide-react";
import { StorePortalShell, useStoreIdentity } from "@/components/store/StorePortalShell";
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

function StoreDashboardContent() {
  const { store, toggleStoreOpen } = useStoreIdentity();
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
        setToast(`"${form.name}" added to ${store?.name || "your storefront"} catalog.`);
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
    const idx = flow.indexOf(order.status);
    const next = flow[Math.min(flow.length - 1, (idx === -1 ? 0 : idx) + 1)];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    await fetch("/api/v1/store/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: next }),
    }).catch(() => {});
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_naira || 0), 0);
  const pendingOrders = orders.filter((o) => o.status !== "Delivered").length;
  const totalStockUnits = products.reduce((s, p) => s + Number(p.stock || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Store Identity & Command Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] text-white p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#B22222]/25 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B22222] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                <Store className="w-3.5 h-3.5" />
                {store?.category || "Estate Storefront"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                  store?.isOpen !== false
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${store?.isOpen !== false ? "bg-emerald-400" : "bg-amber-400"}`} />
                {store?.isOpen !== false ? "Live on Resident Storefront" : "Archived / Hidden"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {store?.name || "Store Owner Dashboard"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                Store Admin: <strong className="text-white">{store?.owner_name || "Unassigned"}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                Unit: <strong className="text-white">{store?.shop_unit || "Commercial Plaza"}</strong>
              </span>
              {store?.owner_email && (
                <span className="text-slate-400">{store.owner_email}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {store && (
              <button
                type="button"
                onClick={toggleStoreOpen}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{store.isOpen ? "Pause Storefront" : "Activate Storefront"}</span>
              </button>
            )}
            <Link
              href="/store-app/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#C9A227]" />
              <span>Orders &amp; Fulfillment</span>
            </Link>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] hover:bg-[#991b1b] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Product</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Store Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">From {orders.length} resident orders</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Fulfillment</p>
            <p className="text-2xl font-extrabold text-[#B22222] mt-1">{pendingOrders}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting delivery</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#B22222] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Catalog Products</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{products.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Live in Resident Storefront</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#C9A227] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stock Units</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalStockUnits}</p>
            <p className="text-[11px] text-slate-400 mt-1">Available inventory</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Orders & Storefront Catalog Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resident Customer Orders (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Resident Customer Orders</h2>
              <p className="text-xs text-slate-400">Live orders with resident delivery instructions</p>
            </div>
            <Link
              href="/store-app/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#B22222] hover:underline"
            >
              <span>Fulfillment Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-10 text-center text-xs text-slate-400">Loading store orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No resident orders placed yet</p>
                <p className="text-[11px] text-slate-400">
                  Once residents order from your catalog, their items and delivery comments will appear here.
                </p>
              </div>
            ) : (
              orders.slice(0, 6).map((o) => (
                <div key={o.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#B22222]">{o.order_no}</span>
                      <span className="text-xs font-extrabold text-slate-900 truncate">{o.product_name}</span>
                      <span className="text-[11px] font-semibold text-slate-500">× {o.quantity}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {o.resident_name} • <span className="text-slate-500">{o.unit_number}</span>
                    </p>
                    {o.delivery_comment && (
                      <p className="inline-flex items-center gap-1.5 text-[11px] bg-amber-50 border border-amber-200/70 text-amber-900 px-2.5 py-1 rounded-lg">
                        <MessageSquareText className="w-3 h-3 text-[#C9A227] shrink-0" />
                        <span>{o.delivery_comment}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-extrabold text-slate-900">₦{o.total_naira.toLocaleString()}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        o.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {o.status === "Delivered" ? <CheckCircle2 className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      {o.status}
                    </span>
                    {o.status !== "Delivered" && (
                      <button
                        type="button"
                        onClick={() => advanceOrder(o)}
                        className="text-[11px] font-bold text-[#B22222] hover:underline cursor-pointer"
                      >
                        Advance Status →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Storefront Product Catalog (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Storefront Product Catalog</h2>
              <p className="text-xs text-slate-400">Displayed to residents in e-commerce format</p>
            </div>
            <Link
              href="/store-app/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#B22222] hover:underline"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {products.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No products uploaded yet</p>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] hover:bg-[#991b1b] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/40 hover:bg-white transition-colors">
                    <div className="h-24 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#B22222]">₦{p.price.toLocaleString()}</span>
                        <span className="text-slate-500 font-semibold">{p.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Commercial Shop Service Charges */}
      <ResidentServiceChargePanel scope="store" />

      {/* Upload Product Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Upload Store Product</h3>
              <button type="button" onClick={() => setAddOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Product Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Golden Penny Semovita 5kg"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold"
                  >
                    <option>Groceries</option>
                    <option>Beverages</option>
                    <option>Household</option>
                    <option>Hardware &amp; Home</option>
                    <option>Electronics</option>
                    <option>Pharmacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price (₦)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="4500"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Product Picture</label>
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-100">
                  <Upload className="w-4 h-4 text-[#B22222]" />
                  <span>{form.image ? "Image attached (click to change)" : "Choose product photo"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description for estate residents..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#B22222] hover:bg-[#991b1b] py-2.5 text-xs font-extrabold text-white disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Uploading..." : "Publish Product to Storefront"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreDashboard() {
  return (
    <StorePortalShell>
      <StoreDashboardContent />
    </StorePortalShell>
  );
}
