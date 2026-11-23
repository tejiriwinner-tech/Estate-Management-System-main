"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ServiceShare } from "@/types/finance";

interface RevenueByServiceChartProps {
  data: ServiceShare[];
}

export function RevenueByServiceChart({ data }: RevenueByServiceChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-800">Revenue by Service</h2>
      </div>

      {/* Donut Chart */}
      <div className="relative flex h-[190px] w-full items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ServiceShare;
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-md">
                      <p className="text-xs font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="text-xs font-medium text-emerald-600">
                        ₦{item.value.toLocaleString()} ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="pt-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
