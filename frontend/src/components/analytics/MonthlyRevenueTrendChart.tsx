"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MonthlyRevenuePoint } from "@/types/analytics";

interface MonthlyRevenueTrendChartProps {
  data: MonthlyRevenuePoint[];
}

export function MonthlyRevenueTrendChart({
  data,
}: MonthlyRevenueTrendChartProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-extrabold tracking-tight text-dark">
          Monthly Revenue Trend
        </h2>

        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span>Current Year</span>
        </div>
      </div>

      {/* Smooth Spline Area Chart */}
      <div className="h-[260px] sm:h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="monthlyTrendGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#B22222" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#B22222" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
              tickFormatter={(v: number) => `₦${v.toFixed(1)}M`}
              domain={[0, 1.6]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as MonthlyRevenuePoint;
                  return (
                    <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-lg">
                      <p className="text-[11px] font-semibold text-slate-400">
                        {pt.month} 2024
                      </p>
                      <p className="text-sm font-extrabold text-primary mt-0.5">
                        ₦{pt.amount.toFixed(2)}M
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
              fill="url(#monthlyTrendGradient)"
              dot={{
                r: 3.5,
                fill: "#B22222",
                stroke: "#FFFFFF",
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 5.5,
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
