"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Store, Plus, CheckCircle2, Archive, RotateCcw, KeyRound, Mail, Building2, X } from "lucide-react";

interface EstateStore {
  id: number;
  name: string;
  category: string;
  shop_unit: string;
  owner_name: string;
  owner_email: string;
  status: string;
  created_at?: string;
}

export default function AdminStoreManagementPage() {
  const [stores, setStores] = useState<EstateStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Groceries & Essentials",
    shop_unit: "Commercial Plaza Shop A-02",
    owner_name: "",
    owner_email: "",
    password: "",
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/stores", { cache: "no-store" });
      const json = await res.json();
      setStores(json.data || []);
    } catch {
      setStores([]);
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
      setToast(json.message || "Store & Store Admin created.");
      setTimeout(() => setToast(null), 5000);
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
    await load();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-tight">Store Management</h1>
          <p className="text-sm text-muted">
            Create estate stores and provision Store Admin login credentials for Post Army House Estate.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Store &amp; Store Admin</span>
        </button>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Stores</span>
          <p className="text-2xl font-black text-dark mt-1">{stores.length}</p>
          <span className="text-[11px] text-muted">Registered in Post Army House Estate</span>
        </div>
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Active Stores</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {stores.filter((s) => s.status !== "archived").length}
          </p>
          <span className="text-[11px] text-muted">Live for resident ordering</span>
        </div>
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Archived Stores</span>
          <p className="text-2xl font-black text-slate-500 mt-1">
            {stores.filter((s) => s.status === "archived").length}
          </p>
          <span className="text-[11px] text-muted">Suspended or inactive</span>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-surface-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border/70 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <h2 className="text-base font-extrabold text-dark">Registered Estate Stores &amp; Store Admins</h2>
          </div>
          <span className="text-xs font-semibold text-muted">{stores.length} stores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-border/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-5">Store Name</th>
                <th className="py-3.5 px-4">Shop Unit</th>
                <th className="py-3.5 px-4">Store Admin</th>
                <th className="py-3.5 px-4">Login Email</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted">Loading stores…</td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted">No stores created yet.</td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-dark">{s.name}</p>
                      <p className="text-[11px] text-muted">{s.category}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{s.shop_unit}</td>
                    <td className="py-3.5 px-4 font-bold text-dark">{s.owner_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{s.owner_email}</td>
                    <td className="py-3.5 px-4">
                      {s.status === "archived" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Archived
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => void toggleStatus(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700"
                      >
                        {s.status === "archived" ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <Archive className="w-3.5 h-3.5 text-amber-600" />
                            <span>Archive</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Store Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
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
