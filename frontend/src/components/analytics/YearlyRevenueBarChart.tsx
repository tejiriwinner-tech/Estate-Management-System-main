"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { YearlyRevenuePoint } from "@/types/analytics";

interface YearlyRevenueBarChartProps {
  data: YearlyRevenuePoint[];
}

export function YearlyRevenueBarChart({ data }: YearlyRevenueBarChartProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="pb-4">
        <h2 className="text-base font-extrabold tracking-tight text-dark">
          Yearly Revenue Trend (2020–2024)
        </h2>
      </div>

      {/* Vertical Bar Chart */}
      <div className="h-[220px] sm:h-[240px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barSize={38}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />

            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
              tickFormatter={(v: number) => `₦${v}M`}
              domain={[0, 16]}
              ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16]}
            />

            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as YearlyRevenuePoint;
                  return (
                    <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-lg">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Year {pt.year}
                      </p>
                      <p className="text-sm font-extrabold text-primary mt-0.5">
                        ₦{pt.amount.toFixed(1)}M
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey="amount"
              fill="#B22222"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
