"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COMMISSION_RATE, EarningsPoint, Listing } from "@/types/agentPortal";
import { formatNaira, formatNairaShort } from "./portalUtils";

interface EarningsSectionProps {
  earnings: EarningsPoint[];
  listings: Listing[];
}

export function EarningsSection({ earnings, listings }: EarningsSectionProps) {
  const total = earnings.reduce((s, e) => s + e.commission, 0);
  const underOffer = listings.filter((l) => l.status === "Under Offer");
  const lastIndex = earnings.length - 1;

  return (
    <section id="earnings" className="scroll-mt-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="pb-4">
        <h2 className="text-base font-bold text-slate-800">Earnings</h2>
        <p className="mt-0.5 text-xs font-medium text-slate-400">
          <span className="font-bold text-slate-700">{formatNaira(total)}</span> commission in the last {earnings.length} months ·{" "}
          {Math.round(COMMISSION_RATE * 100)}% of first-year rent
        </p>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={earnings} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} dy={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              tickFormatter={(v) => (v === 0 ? "₦0" : formatNairaShort(v as number))}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="text-sm font-bold text-primary">{formatNaira(payload[0].value as number)}</p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="commission" radius={[6, 6, 0, 0]} maxBarSize={34}>
              {earnings.map((_, i) => (
                <Cell key={i} fill={i === lastIndex ? "#C9A227" : "#B22222"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Coming up</p>
        {underOffer.length === 0 ? (
          <p className="text-xs font-medium text-slate-400">No listings under offer right now.</p>
        ) : (
          <ul className="space-y-2">
            {underOffer.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{l.title}</span>
                <span className="flex-shrink-0 font-bold text-accent-dark">
                  +{formatNaira(Math.round(l.rentPerYear * COMMISSION_RATE))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
