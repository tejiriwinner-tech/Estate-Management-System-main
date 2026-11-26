"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Power, Save, Store, UserCheck } from "lucide-react";
import { StorePortalShell, useStoreIdentity } from "@/components/store/StorePortalShell";

function StoreSettingsContent() {
  const { store, refreshStore, toggleStoreOpen } = useStoreIdentity();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General & Groceries");
  const [shopUnit, setShopUnit] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setCategory(store.category || "General & Groceries");
      setShopUnit(store.shop_unit || "");
      setOwnerName(store.owner_name || "");
    }
  }, [store]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/store/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: store?.id,
          name: name.trim(),
          category,
          shop_unit: shopUnit.trim(),
          owner_name: ownerName.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "Could not save store settings.");
        return;
      }
      await refreshStore();
      setToast("Store profile and settings saved.");
      setTimeout(() => setToast(null), 4000);
    } catch {
      setError("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B22222]">
            {store?.name || "Store Owner Hub"} • Settings
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Store Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your Post Army Housing Estate storefront profile, shop unit, and availability.
          </p>
        </div>

        {store && (
          <button
            type="button"
            onClick={toggleStoreOpen}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition-colors cursor-pointer ${
              store.isOpen
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{store.isOpen ? "Storefront Open" : "Storefront Paused"}</span>
          </button>
        )}
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Store className="w-4 h-4 text-[#B22222]" />
          <h2 className="text-sm font-extrabold text-slate-900">Storefront &amp; Merchant Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Store Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TEE Plaza"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Store Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]/20"
            >
              <option value="General & Groceries">General &amp; Groceries</option>
              <option value="Hardware & Home">Hardware &amp; Home</option>
              <option value="Pharmacy & Wellness">Pharmacy &amp; Wellness</option>
              <option value="Food & Bakery">Food &amp; Bakery</option>
              <option value="Electronics & Solar">Electronics &amp; Solar</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-[#C9A227]" /> Shop / Unit Location</span>
            </label>
            <input
              required
              value={shopUnit}
              onChange={(e) => setShopUnit(e.target.value)}
              placeholder="e.g. Commercial Plaza Shop A-02"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
              <span className="inline-flex items-center gap-1"><UserCheck className="w-3 h-3 text-[#C9A227]" /> Store Admin Name</span>
            </label>
            <input
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. FELIX"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Store Admin Login Email</label>
            <input
              disabled
              value={store?.owner_email || ""}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] hover:bg-[#991b1b] px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Store Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function StoreAppSettingsPage() {
  return (
    <StorePortalShell>
      <StoreSettingsContent />
    </StorePortalShell>
  );
}
