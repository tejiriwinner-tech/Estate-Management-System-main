"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { RevenueHistoryPoint } from "@/types/finance";

interface RevenueHistoryChartProps {
  data: RevenueHistoryPoint[];
}

export function RevenueHistoryChart({ data }: RevenueHistoryChartProps) {
  const [selectedRange, setSelectedRange] = useState("Yearly");

  const formatCurrency = (val: number) => {
    if (val === 0) return "₦0";
    return `₦${val.toLocaleString()}`;
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Revenue History</h2>
        </div>

        {/* Range Selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>{selectedRange}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Recharts Area / Spline */}
      <div className="h-[260px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B22222" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#B22222" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 2"
              vertical={false}
              stroke="#F1F5F9"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              tickFormatter={(v) => (v === 0 ? "₦0" : `₦${(v / 1000).toFixed(0)}k`)}
              domain={[0, 1600000]}
              ticks={[0, 200000, 400000, 600000, 800000, 1000000, 1200000, 1400000, 1600000]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg">
                      <p className="text-xs font-medium text-slate-500">
                        {payload[0].payload.month}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#B22222"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              dot={{
                r: 3.5,
                fill: "#FFFFFF",
                stroke: "#B22222",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: "#C9A227",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
