"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AgentPerformancePoint } from "@/types/agent";

interface AgentPerformanceChartProps {
  data: AgentPerformancePoint[];
}

type Range = "6M" | "12M";

export function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  const [range, setRange] = useState<Range>("12M");

  const chartData = range === "12M" ? data : data.slice(-6);
  const totalCommission = chartData.reduce((s, d) => s + d.commission, 0);
  const totalDeals = chartData.reduce((s, d) => s + d.dealsClosed, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Sales Performance
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            <span className="font-bold text-slate-700">
              ₦{(totalCommission / 1_000_000).toFixed(1)}M
            </span>{" "}
            commission from{" "}
            <span className="font-bold text-slate-700">{totalDeals}</span> deals
            in the last {range === "12M" ? "12" : "6"} months
          </p>
          <div className="mt-1.5 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              Commission (₦)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded bg-accent" />
              Deals closed
            </span>
          </div>
        </div>

        <div className="flex rounded-lg border border-slate-200 p-0.5">
          {(["6M", "12M"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                range === r
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
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
              yAxisId="commission"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              tickFormatter={(v) =>
                v === 0 ? "₦0" : `₦${(v / 1_000_000).toFixed(1)}M`
              }
            />
            <YAxis
              yAxisId="deals"
              orientation="right"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: "#94A3B8", fontSize: 10 }}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as AgentPerformancePoint;
                return (
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="text-sm font-bold text-primary">
                      ₦{point.commission.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-accent-dark">
                      {point.dealsClosed} deals closed
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              yAxisId="commission"
              dataKey="commission"
              fill="#B22222"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Line
              yAxisId="deals"
              type="monotone"
              dataKey="dealsClosed"
              stroke="#C9A227"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#C9A227", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#C9A227", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
