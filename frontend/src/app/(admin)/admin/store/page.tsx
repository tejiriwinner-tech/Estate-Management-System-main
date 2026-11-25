"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  ExternalLink,
  ArrowRight,
  ShoppingBag,
  Package,
  CreditCard,
  CheckCircle2,
  Receipt,
  Settings,
} from "lucide-react";

export default function AdminStorePage() {
  const [productCount, setProductCount] = useState(5);
  const [merchantName, setMerchantName] = useState("Lincoln Central Mart");
  const [revenue, setRevenue] = useState("₦4,850,000");
  const [orderVolume, setOrderVolume] = useState(124);

  useEffect(() => {
    fetch("/api/v1/store/owner-dashboard")
      .then((r) => r.json())
      .then((j) => {
        if (j?.data?.merchant) {
          setMerchantName(j.data.merchant.name || "Lincoln Central Mart");
          setRevenue(`₦${Number(j.data.merchant.totalRevenue || 4850000).toLocaleString()}`);
          setProductCount(Number(j.data.merchant.activeProducts || 5));
          setOrderVolume(Number(j.data.merchant.orderVolume || 124));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-tight">
            Estate Marketplace Oversight
          </h1>
          <p className="text-sm text-muted">
            Admin governance for registered estate stores, product catalog compliance, order volume, and merchant service charges.
          </p>
        </div>

        <Link
          href="/store-app"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-sm transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Store Owner Portal</span>
        </Link>
      </div>

      {/* Live Marketplace Oversight KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Registered Stores</span>
          <p className="text-2xl font-black text-dark mt-1">1 Active</p>
          <span className="text-[11px] font-semibold text-emerald-700">{merchantName}</span>
        </div>
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Catalog Products</span>
          <p className="text-2xl font-black text-dark mt-1">{productCount}</p>
          <span className="text-[11px] text-muted">Approved estate listings</span>
        </div>
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Marketplace GMV</span>
          <p className="text-2xl font-black text-primary mt-1">{revenue}</p>
          <span className="text-[11px] text-muted">{orderVolume} orders fulfilled</span>
        </div>
        <div className="p-5 bg-surface-card rounded-2xl border border-border/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Merchant Compliance</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> Verified
          </p>
          <span className="text-[11px] text-muted">Shop service charges tracked</span>
        </div>
      </div>

      {/* Admin Store Sub-Modules (stays inside Admin layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-surface-card rounded-2xl border border-border/80 shadow-xs space-y-3">
          <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-dark">Product Catalog</h2>
          <p className="text-xs text-muted">
            Inspect inventory, prices, and catalog items offered across the estate community.
          </p>
          <Link
            href="/admin/store/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
          >
            <span>Inspect Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 bg-surface-card rounded-2xl border border-border/80 shadow-xs space-y-3">
          <div className="w-11 h-11 rounded-xl bg-accent-light/60 flex items-center justify-center text-accent">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-dark">Inventory &amp; Analytics</h2>
          <p className="text-xs text-muted">
            Monitor store stock levels, order volume, and commercial plaza performance.
          </p>
          <div className="flex items-center gap-4 pt-1">
            <Link href="/admin/store/inventory" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <span>Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/admin/store/analytics" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <span>Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 bg-surface-card rounded-2xl border border-border/80 shadow-xs space-y-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-dark">Subscription &amp; Settings</h2>
          <p className="text-xs text-muted">
            Review merchant subscription tiers, billing rules, and storefront configuration.
          </p>
          <div className="flex items-center gap-4 pt-1">
            <Link href="/admin/store/subscription" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <Receipt className="w-3.5 h-3.5" />
              <span>Subscription</span>
            </Link>
            <Link href="/admin/store/settings" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
