"use client";

import React from "react";
import Link from "next/link";
import { Store, ExternalLink, ArrowRight, ShoppingBag, Package, CreditCard } from "lucide-react";

export default function AdminStorePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-tight">Estate Store & Commerce</h1>
          <p className="text-sm text-muted">
            Manage merchants, merchant products, orders, and estate storefront operations.
          </p>
        </div>

        <Link
          href="/store-app"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Full Store App</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-surface-card rounded-2xl border border-border/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-dark">Active Merchants</h2>
          <p className="text-sm text-muted">
            View registered vendors, manage estate grocery and service provider storefronts.
          </p>
          <Link
            href="/store-app/stores"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
          >
            <span>Manage Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 bg-surface-card rounded-2xl border border-border/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-accent-light/60 flex items-center justify-center text-accent">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-dark">Product Catalog</h2>
          <p className="text-sm text-muted">
            Inspect inventory, prices, and catalog items offered across the estate community.
          </p>
          <Link
            href="/store-app/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
          >
            <span>View Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 bg-surface-card rounded-2xl border border-border/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-dark">Store Dashboard</h2>
          <p className="text-sm text-muted">
            Access merchant revenue charts, orders, fulfillment tracking, and transaction fees.
          </p>
          <Link
            href="/store-app/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
          >
            <span>Store Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}


