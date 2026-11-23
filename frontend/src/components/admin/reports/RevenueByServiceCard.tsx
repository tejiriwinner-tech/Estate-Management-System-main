"use client";

import React, { useState } from "react";
import { ServiceRevenueShare } from "@/types/admin/reports";
import { cn } from "@/lib/admin/utils";

interface RevenueByServiceCardProps {
  services: ServiceRevenueShare[];
}

export function RevenueByServiceCard({ services }: RevenueByServiceCardProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="bg-surface-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Revenue by Service
        </h2>
      </div>

      {/* Center Circular Ring Visual (Matching Figma subtle concentric ring + interactive highlight) */}
      <div className="my-6 flex items-center justify-center">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {/* Soft Base Ring */}
            <circle
              cx="80"
              cy="80"
              r="64"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="8"
            />
            {selectedService && (
              <circle
                cx="80"
                cy="80"
                r="64"
                fill="none"
                stroke={selectedService.strokeColor}
                strokeWidth="8"
                strokeDasharray={`${(selectedService.percentage / 100) * 402} 402`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}
          </svg>

          {selectedService && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-extrabold text-dark">
                {selectedService.percentage}%
              </span>
              <span className="text-xs font-bold text-primary mt-0.5">
                {selectedService.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 2x2 Legend Pills Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() =>
                setSelectedServiceId(isSelected ? null : service.id)
              }
              className={cn(
                "px-3 py-2.5 rounded-xl bg-[#EEF2F8] hover:bg-[#E4EAF3] transition-all flex items-center justify-between gap-2 text-left",
                isSelected && "ring-2 ring-primary/50 bg-primary-light/40"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    service.dotColorClass
                  )}
                />
                <span className="text-xs font-semibold text-primary truncate">
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
