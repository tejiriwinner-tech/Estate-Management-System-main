"use client";

import React from "react";
import Link from "next/link";
import { Store, Plus, CheckCircle2, MapPin, Phone, ExternalLink } from "lucide-react";
import { StoreShell } from "../components/store-screens";

const MERCHANTS = [
  {
    id: "LM-001",
    name: "Post Army House Mart",
    category: "Supermarket & Household Groceries",
    zone: "Army Estate Phase 1 — Commercial Plaza",
    phone: "+234 802 555 0148",
    status: "Open",
    productsCount: 42,
  },
  {
    id: "LM-002",
    name: "MedPlus Estate Pharmacy",
    category: "Pharmacy & Wellness",
    zone: "Army Estate Phase 2 — Gate Boulevard",
    phone: "+234 803 441 9022",
    status: "Open",
    productsCount: 28,
  },
  {
    id: "LM-003",
    name: "Prime Hardware & Electricals",
    category: "Maintenance & Solar Supplies",
    zone: "Army Estate Phase 3 — Service Hub",
    phone: "+234 809 112 7740",
    status: "Open",
    productsCount: 19,
  },
];

export default function StoreMerchantsDirectoryPage() {
  return (
    <StoreShell activeNav="Store Overview">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Commercial Directory
            </p>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              Registered Estate Merchants
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified commercial vendors operating across Army Estate Phases 1–5.
            </p>
          </div>

          <Link
            href="/store-app/stores/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Merchant</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MERCHANTS.map((m) => (
            <article
              key={m.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#B22222] flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> {m.status}
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[11px] font-bold text-slate-400">#{m.id}</span>
                  <h2 className="text-base font-extrabold text-slate-900">{m.name}</h2>
                  <p className="text-xs text-slate-500">{m.category}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B22222]" />
                    <span>{m.zone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{m.productsCount} Listed Items</span>
                <Link
                  href="/store-app"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#B22222] hover:underline"
                >
                  <span>Open Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </StoreShell>
  );
}
