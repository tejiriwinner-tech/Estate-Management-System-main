"use client";

import React, { useState } from "react";
import { ServiceRevenueShare } from "@/types/admin/reports";
import { cn } from "@/lib/admin/utils";

interface RevenueByServiceCardProps {
  services: (ServiceRevenueShare & { color?: string })[];
}

const FALLBACK_COLORS = ["#B22222", "#C9A227", "#1E293B", "#10B981"];

export function RevenueByServiceCard({ services }: RevenueByServiceCardProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const normalized = services.map((s, idx) => ({
    ...s,
    id: s.id || s.name.toLowerCase().replace(/\s+/g, "-"),
    strokeColor: s.strokeColor || s.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
    dotColorClass: s.dotColorClass || "bg-[#B22222]",
  }));

  const selectedService = normalized.find((s) => s.id === selectedServiceId);
  const circumference = 2 * Math.PI * 60; // ~377
  let cumulativePct = 0;

  return (
    <div className="bg-surface-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Revenue by Service
        </h2>
      </div>

      <div className="my-6 flex items-center justify-center">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="14"
            />
            {normalized.map((service) => {
              const arcLen = (service.percentage / 100) * circumference;
              const offset = -((cumulativePct / 100) * circumference);
              cumulativePct += service.percentage;
              const isDimmed = selectedService && selectedService.id !== service.id;

              return (
                <circle
                  key={service.id}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={service.strokeColor}
                  strokeWidth={selectedService?.id === service.id ? "17" : "14"}
                  strokeDasharray={`${arcLen} ${circumference}`}
                  strokeDashoffset={offset}
                  opacity={isDimmed ? 0.3 : 1}
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    setSelectedServiceId(selectedServiceId === service.id ? null : service.id)
                  }
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {selectedService ? (
              <>
                <span className="text-2xl font-extrabold text-dark">
                  {selectedService.percentage}%
                </span>
                <span className="text-[11px] font-bold text-primary mt-0.5 leading-tight">
                  {selectedService.name}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-extrabold text-dark">100%</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">
                  Revenue Mix
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {normalized.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => setSelectedServiceId(isSelected ? null : service.id)}
              className={cn(
                "px-3 py-2.5 rounded-xl bg-[#EEF2F8] hover:bg-[#E4EAF3] transition-all flex items-center justify-between gap-2 text-left",
                isSelected && "ring-2 ring-primary/50 bg-primary-light/40"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: service.strokeColor }}
                />
                <span className="text-xs font-semibold text-dark truncate">
                  {service.name}
                </span>
              </div>

              <span className="text-xs sm:text-sm font-extrabold text-dark shrink-0">
                {service.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
