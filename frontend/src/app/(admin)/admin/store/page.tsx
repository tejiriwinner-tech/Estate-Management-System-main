"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Store,
  Plus,
  CheckCircle2,
  Archive,
  RotateCcw,
  KeyRound,
  Mail,
  Building2,
  X,
  Package,
  Star,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

interface EstateStore {
  id: number;
  name: string;
  category: string;
  shop_unit: string;
  owner_name: string;
  owner_email: string;
  status: string;
  is_promoted?: boolean;
  created_at?: string;
}

interface StoreProduct {
  id: number;
  store_id: number;
  store_name: string;
  shop_unit: string;
  store_status?: string;
  store_promoted?: boolean;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image?: string | null;
  featured: boolean;
  admin_visible: boolean;
}

export default function AdminStoreManagementPage() {
  const [tab, setTab] = useState<"stores" | "items">("stores");
  const [stores, setStores] = useState<EstateStore[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Item merchandising filters
  const [itemSearch, setItemSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | "PROMOTED" | "STANDARD" | "HIDDEN">("ALL");

  const [form, setForm] = useState({
    name: "",
    category: "Groceries & Essentials",
    shop_unit: "Commercial Plaza Shop A-02",
    owner_name: "",
    owner_email: "",
    password: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        fetch("/api/v1/admin/stores", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/v1/store/products", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setStores(Array.isArray(sRes?.data) ? sRes.data : []);
      setProducts(Array.isArray(pRes?.data) ? pRes.data : []);
    } catch {
      setStores([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Could not create store.");
      showToast(json.message || "Store & Store Admin created.");
      setForm({
        name: "",
        category: "Groceries & Essentials",
        shop_unit: "Commercial Plaza Shop A-03",
        owner_name: "",
        owner_email: "",
        password: "",
      });
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create store.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (store: EstateStore) => {
    const next = store.status === "archived" ? "active" : "archived";
    await fetch("/api/v1/admin/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: store.id, status: next }),
    }).catch(() => {});
    showToast(`${store.name} ${next === "archived" ? "archived (hidden from residents)" : "restored to active"}.`);
    await load();
  };

  const toggleStorePromotion = async (store: EstateStore) => {
    const next = !store.is_promoted;
    await fetch("/api/v1/admin/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: store.id, is_promoted: next }),
    }).catch(() => {});
    showToast(
      next
        ? `${store.name} promoted to featured placement for residents.`
        : `${store.name} demoted from featured placement.`
    );
    await load();
  };

  const toggleProductFeatured = async (item: StoreProduct) => {
    const next = !item.featured;
    setProducts((prev) => prev.map((p) => (p.id === item.id ? { ...p, featured: next } : p)));
    await fetch("/api/v1/store/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, featured: next }),
    }).catch(() => {});
    showToast(
      next
        ? `"${item.name}" promoted to Featured for all residents.`
        : `"${item.name}" demoted to standard listing.`
    );
  };

  const toggleProductVisibility = async (item: StoreProduct) => {
    const next = !item.admin_visible;
    setProducts((prev) => prev.map((p) => (p.id === item.id ? { ...p, admin_visible: next } : p)));
    await fetch("/api/v1/store/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, admin_visible: next }),
    }).catch(() => {});
    showToast(
      next
        ? `"${item.name}" is now visible to residents.`
        : `"${item.name}" hidden from resident marketplace.`
    );
  };

  const itemCountByStore = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of products) {
      m.set(p.store_id, (m.get(p.store_id) || 0) + 1);
    }
    return m;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (storeFilter !== "ALL" && String(p.store_id) !== storeFilter) return false;
      if (visibilityFilter === "PROMOTED" && (!p.featured || !p.admin_visible)) return false;
      if (visibilityFilter === "STANDARD" && (p.featured || !p.admin_visible)) return false;
      if (visibilityFilter === "HIDDEN" && p.admin_visible) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.store_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, storeFilter, visibilityFilter, itemSearch]);

  const activeCount = stores.filter((s) => s.status !== "archived").length;
  const promotedStoresCount = stores.filter((s) => s.is_promoted && s.status !== "archived").length;
  const promotedItemsCount = products.filter((p) => p.featured && p.admin_visible).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tight">Store &amp; Marketplace Control</h1>
          <p className="text-sm text-muted">
            Manage estate shops, inspect items posted by shop owners, and promote or demote visibility to residents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Store &amp; Store Admin</span>
        </button>
      </div>

      {toast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-surface-card border border-border/80 p-5 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Stores</p>
          <p className="text-3xl font-black text-dark mt-1">{stores.length}</p>
          <p className="text-xs text-muted mt-1">{activeCount} active for residents</p>
        </div>
        <div className="rounded-2xl bg-surface-card border border-border/80 p-5 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Promoted Shops</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{promotedStoresCount}</p>
          <p className="text-xs text-muted mt-1">Boosted at top of marketplace</p>
        </div>
        <div className="rounded-2xl bg-surface-card border border-border/80 p-5 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Posted Shop Items</p>
          <p className="text-3xl font-black text-dark mt-1">{products.length}</p>
          <p className="text-xs text-muted mt-1">Uploaded across all shops</p>
        </div>
        <div className="rounded-2xl bg-surface-card border border-border/80 p-5 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Featured Items</p>
          <p className="text-3xl font-black text-[#B22222] mt-1">{promotedItemsCount}</p>
          <p className="text-xs text-muted mt-1">Promoted to estate residents</p>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setTab("stores")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            tab === "stores"
              ? "bg-[#B22222] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Registered Stores ({stores.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("items")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
            tab === "items"
              ? "bg-[#B22222] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Shop Items &amp; Promotions ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: REGISTERED STORES */}
      {tab === "stores" && (
        <div className="rounded-2xl bg-surface-card border border-border/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-dark flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Registered Estate Stores &amp; Store Admins</span>
            </h2>
            <span className="text-xs font-semibold text-muted">{stores.length} stores</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted">Loading estate stores…</div>
          ) : stores.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-dark">No stores registered yet</p>
              <p className="text-xs text-muted">
                Click &ldquo;Create Store &amp; Store Admin&rdquo; to register a shop in Post Army Housing Estate.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-6">Store Name</th>
                    <th className="py-3 px-4">Shop Unit</th>
                    <th className="py-3 px-4">Store Admin</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Placement</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((s) => {
                    const count = itemCountByStore.get(s.id) || 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-6">
                          <div className="font-extrabold text-dark">{s.name}</div>
                          <div className="text-[11px] text-muted">{s.category}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{s.shop_unit}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-dark">{s.owner_name}</div>
                          <div className="text-[11px] text-slate-500">{s.owner_email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setStoreFilter(String(s.id));
                              setTab("items");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-extrabold text-slate-800 transition-colors"
                          >
                            <Package className="w-3 h-3 text-[#B22222]" />
                            <span>{count} item{count === 1 ? "" : "s"}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {s.is_promoted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Promoted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              s.status === "archived"
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {s.status === "archived" ? "Archived" : "Active"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void toggleStorePromotion(s)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                                s.is_promoted
                                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-200"
                              }`}
                            >
                              {s.is_promoted ? (
                                <>
                                  <ArrowDownCircle className="w-3.5 h-3.5" /> Demote
                                </>
                              ) : (
                                <>
                                  <ArrowUpCircle className="w-3.5 h-3.5 text-amber-600" /> Promote
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => void toggleStatus(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                            >
                              {s.status === "archived" ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Restore
                                </>
                              ) : (
                                <>
                                  <Archive className="w-3.5 h-3.5 text-amber-600" /> Archive
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SHOP ITEMS & PROMOTIONS */}
      {tab === "items" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search item, SKU, category, shop..."
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
                />
              </div>

              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="ALL">All Shops ({stores.length})</option>
                {stores.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name} ({s.shop_unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "ALL", label: "All Items" },
                  { id: "PROMOTED", label: "Promoted" },
                  { id: "STANDARD", label: "Standard" },
                  { id: "HIDDEN", label: "Hidden" },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setVisibilityFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    visibilityFilter === pill.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-2 shadow-2xs">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No shop items match this filter</p>
              <p className="text-xs text-slate-500">
                Items uploaded by Shop Owners in their Store Dashboard appear here automatically for Admin review and promotion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl bg-white border overflow-hidden shadow-2xs flex flex-col justify-between transition-all ${
                    !item.admin_visible
                      ? "border-slate-300 opacity-75"
                      : item.featured
                      ? "border-amber-300 ring-1 ring-amber-200"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                        {item.featured && item.admin_visible && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                            <Sparkles className="w-3 h-3" /> Promoted
                          </span>
                        )}
                        {!item.admin_visible && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                            <EyeOff className="w-3 h-3" /> Hidden from Users
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-black text-slate-900 shadow-xs">
                        ₦{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{item.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{item.sku}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#B22222]">
                        {item.store_name} • {item.shop_unit}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.category} • Stock: <strong>{item.stock}</strong>
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 pt-1">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleProductFeatured(item)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold border transition-colors ${
                        item.featured
                          ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-amber-50 hover:border-amber-300"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-amber-500 text-amber-500" : "text-amber-500"}`} />
                      <span>{item.featured ? "Demote" : "Promote"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void toggleProductVisibility(item)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold border transition-colors ${
                        item.admin_visible
                          ? "bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {item.admin_visible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Store Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-dark">Create Store &amp; Store Admin</h3>
                <p className="text-xs text-muted">
                  The Store Admin can log in immediately on the login page using these credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-dark hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Army Plaza Pharmacy"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-white"
                  >
                    <option>Groceries &amp; Essentials</option>
                    <option>Pharmacy &amp; Health</option>
                    <option>Hardware &amp; Home</option>
                    <option>Food &amp; Catering</option>
                    <option>Electronics &amp; Solar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  <span>Shop Location / Unit</span>
                </label>
                <input
                  required
                  value={form.shop_unit}
                  onChange={(e) => setForm({ ...form, shop_unit: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Admin Name</label>
                  <input
                    required
                    value={form.owner_name}
                    onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                    placeholder="e.g. Musa Ibrahim"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>Login Email</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.owner_email}
                    onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
                    placeholder="storeadmin@postarmyhouse.ng"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>Login Password</span>
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Create Store & Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
