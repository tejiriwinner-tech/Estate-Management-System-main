"use client";

import React, { useState } from "react";
import { Car, Home, Hash } from "lucide-react";
import { VehicleRecord, VehicleStatus } from "@/types/admin/vehicle";
import { cn } from "@/lib/admin/utils";

interface VehicleDirectoryCardProps {
  vehicles: VehicleRecord[];
  totalRegisteredCount: number;
  onToggleStatus?: (id: number) => void;
}

function VehicleStatusBadge({
  status,
  onClick,
}: {
  status: VehicleStatus;
  onClick?: () => void;
}) {
  if (status === "active") {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Click to cycle status"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-light text-accent hover:opacity-90 transition-opacity"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span>ACTIVE</span>
      </button>
    );
  }
  if (status === "disabled") {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Click to cycle status"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E4E8F2] text-dark/80 hover:opacity-90 transition-opacity"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-dark/60" />
        <span>DISABLED</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to cycle status"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FEF3C7] text-[#B45309] hover:opacity-90 transition-opacity"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
      <span>PENDING</span>
    </button>
  );
}

function splitPlateNumber(plate: string): { line1: string; line2: string } {
  const parts = plate.split("-");
  if (parts.length >= 3) {
    return {
      line1: `${parts[0].trim()} - ${parts[1].trim()} -`,
      line2: parts.slice(2).join("-").trim(),
    };
  }
  return { line1: plate, line2: "" };
}

export function VehicleDirectoryCard({
  vehicles,
  totalRegisteredCount,
  onToggleStatus,
}: VehicleDirectoryCardProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedVehicles = showAll ? vehicles : vehicles.slice(0, 4);

  return (
    <div className="bg-surface-card rounded-2xl border border-border/70 shadow-xs overflow-hidden flex flex-col justify-between min-h-[540px]">
      <div>
        {/* Card Header */}
        <div className="px-5 sm:px-6 py-5 flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-xl font-extrabold text-dark tracking-tight">
            Vehicle Directory
          </h2>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs sm:text-sm font-extrabold text-primary hover:text-primary-hover hover:underline transition-colors"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        </div>

        {/* ================= DESKTOP TABLE (md and up) ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F9] border-y border-border/60 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                <th className="py-3.5 pl-6 pr-3">OWNER</th>
                <th className="py-3.5 px-3">
                  <div>HOUSE /</div>
                  <div>UNIT</div>
                </th>
                <th className="py-3.5 px-3">VEHICLE TYPE</th>
                <th className="py-3.5 px-3">
                  <div>PLATE</div>
                  <div>NUMBER</div>
                </th>
                <th className="py-3.5 pl-3 pr-6 text-right">STATUS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50 text-xs sm:text-sm">
              {displayedVehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-muted font-medium"
                  >
                    No vehicles match the selected filter.
                  </td>
                </tr>
              ) : (
                displayedVehicles.map((v) => {
                  const plateParts = splitPlateNumber(v.plate_number);
                  const isVendor = v.owner_role === "Vendor";

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-surface-subtle/60 transition-colors"
                    >
                      {/* Owner */}
                      <td className="py-4 pl-6 pr-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0",
                              isVendor
                                ? "bg-[#E4E8F2] text-dark"
                                : "bg-accent-light/70 text-primary"
                            )}
                          >
                            {v.initials}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-dark leading-snug">
                              {v.owner_name}
                            </div>
                            <div className="text-[11px] text-muted font-medium leading-tight mt-0.5">
                              {v.owner_role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* House / Unit */}
                      <td className="py-4 px-3 align-middle text-dark/90 font-medium">
                        {v.house_unit}
                      </td>

                      {/* Vehicle Type */}
                      <td className="py-4 px-3 align-middle text-dark/90 font-medium leading-snug max-w-[160px]">
                        {v.vehicle_type}
                      </td>

                      {/* Plate Number */}
                      <td className="py-4 px-3 align-middle font-bold text-dark leading-tight tracking-wide">
                        <div>{plateParts.line1}</div>
                        {plateParts.line2 && <div>{plateParts.line2}</div>}
                      </td>

                      {/* Status */}
                      <td className="py-4 pl-3 pr-6 align-middle text-right">
                        <VehicleStatusBadge
                          status={v.status}
                          onClick={
                            onToggleStatus
                              ? () => onToggleStatus(v.id)
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE & SMALL TABLET CARDS (< md) ================= */}
        <div className="md:hidden divide-y divide-border/60 border-t border-border/60">
          {displayedVehicles.length === 0 ? (
            <div className="py-10 px-4 text-center text-sm text-muted font-medium">
              No vehicles match the selected filter.
            </div>
          ) : (
            displayedVehicles.map((v) => (
              <div key={v.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-accent-light/70 text-primary font-extrabold text-xs flex items-center justify-center shrink-0">
                      {v.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-dark text-sm truncate">
                        {v.owner_name}
                      </div>
                      <div className="text-xs text-muted font-medium truncate">
                        {v.owner_role}
                      </div>
                    </div>
                  </div>

                  <VehicleStatusBadge
                    status={v.status}
                    onClick={
                      onToggleStatus ? () => onToggleStatus(v.id) : undefined
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 bg-surface-subtle/60 rounded-xl p-3 border border-border/50 text-xs">
                  <div className="flex items-center gap-1.5 text-dark font-semibold">
                    <Home className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{v.house_unit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-dark font-bold">
                    <Hash className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{v.plate_number}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-muted font-medium">
                    <Car className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{v.vehicle_type}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Caption */}
        <div className="px-6 py-4 border-t border-border/50 text-center">
          <span className="text-xs text-muted font-medium">
            Showing {displayedVehicles.length} of {totalRegisteredCount} vehicles
          </span>
        </div>
      </div>
    </div>
  );
}
