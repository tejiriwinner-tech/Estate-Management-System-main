"use client";

import React, { useState } from "react";
import { MonthlyRevenuePoint } from "@/types/admin/reports";

interface MonthlyRevenueTrendCardProps {
  points: MonthlyRevenuePoint[];
}

const Y_TICKS = [1.6, 1.4, 1.2, 1.0, 0.8, 0.6, 0.4, 0.2, 0.0];

export function MonthlyRevenueTrendCard({
  points,
}: MonthlyRevenueTrendCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG coordinate space
  const width = 660;
  const height = 240;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 8;
  const padBottom = 10;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = 1.6;

  const coords = points.map((pt, i) => {
    const x =
      padLeft + (i / Math.max(1, points.length - 1)) * plotW;
    const y = padTop + (1 - pt.valueM / maxVal) * plotH;
    return { x, y, pt };
  });

  // Smooth cubic bezier path through points
  const buildSmoothPath = () => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cy2 = p1.y;
      d += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(
        1
      )} ${cy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath();
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
          padTop + plotH
        ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(
          1
        )} Z`
      : "";

  return (
    <div className="bg-surface-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Monthly Revenue Trend
        </h2>

        <div className="inline-flex items-center gap-2 text-xs font-bold text-primary">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span>Current Year</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex items-stretch gap-2 sm:gap-3">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between py-1 text-[10px] sm:text-[11px] font-bold text-primary select-none shrink-0 text-right w-11">
          {Y_TICKS.map((tick) => (
            <span key={tick}>₦{tick.toFixed(1)}M</span>
          ))}
        </div>

        {/* Plot Area + X-Axis Labels */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="relative w-full h-[210px] sm:h-[240px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient
                  id="monthlyRevenueAreaGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#B22222" stopOpacity="0.22" />
                  <stop offset="65%" stopColor="#B22222" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#B22222" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {Y_TICKS.map((tick) => {
                const y = padTop + (1 - tick / maxVal) * plotH;
                return (
                  <line
                    key={tick}
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient Area under Curve */}
              <path d={areaPath} fill="url(#monthlyRevenueAreaGrad)" />

              {/* Primary Smooth Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#B22222"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Elliptical / Pill Data Markers matching Figma */}
              {coords.map(({ x, y, pt }, idx) => {
                const isHovered = hoveredIdx === idx;
                if (!pt.showMarker && !isHovered) return null;
                return (
                  <g
                    key={pt.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <ellipse
                      cx={x}
                      cy={y}
                      rx={isHovered ? 9 : 7}
                      ry={isHovered ? 5 : 3.5}
                      fill="#B22222"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIdx !== null && coords[hoveredIdx] && (
              <div
                style={{
                  left: `${(coords[hoveredIdx].x / width) * 100}%`,
                  top: `${Math.max(0, (coords[hoveredIdx].y / height) * 100 - 16)}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full pointer-events-none px-2.5 py-1 rounded-lg bg-dark text-white text-[11px] font-bold shadow-md whitespace-nowrap z-10"
              >
                {coords[hoveredIdx].pt.month}: ₦
                {coords[hoveredIdx].pt.valueM.toFixed(2)}M
              </div>
            )}
          </div>

          {/* X-Axis Labels */}
          <div className="grid grid-cols-12 pt-2 text-[10px] sm:text-[11px] font-semibold text-primary text-center select-none">
            {points.map((pt, idx) => (
              <button
                key={pt.month}
                type="button"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="hover:font-extrabold transition-all"
              >
                {pt.month}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
