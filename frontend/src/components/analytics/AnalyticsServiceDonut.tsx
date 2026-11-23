"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ServiceBreakdownItem } from "@/types/analytics";

interface AnalyticsServiceDonutProps {
  items: ServiceBreakdownItem[];
}

export function AnalyticsServiceDonut({ items }: AnalyticsServiceDonutProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold tracking-tight text-dark">
          Revenue by Service
        </h2>
      </div>

      {/* Donut Chart */}
      <div className="relative flex h-[200px] w-full items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ServiceBreakdownItem;
                  return (
                    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-md">
                      <p className="text-xs font-bold text-dark">{item.name}</p>
                      <p className="text-xs font-extrabold text-primary">
                        {item.percentage}% Share
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={items}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              dataKey="percentage"
              stroke="none"
            >
              {items.map((entry, idx) => (
                <Cell key={`service-cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 2x2 Pill Stat Legend Grid matching Figma */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-100/80"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-slate-600 truncate">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-extrabold text-dark ml-2">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
