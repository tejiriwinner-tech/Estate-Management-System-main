"use client";

import React, { useState, useMemo } from "react";
import {
  Car,
  QrCode,
  LogIn,
  Video,
  Search,
  Home,
  Clock,
  MoreVertical,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useVehicles } from "@/lib/admin/vehicleApi";
import {
  MobileScannerItem,
  MobileVehicleDirectoryItem,
  MobileVehicleMetric,
} from "@/types/admin/vehicle";
import { cn } from "@/lib/admin/utils";

interface VehicleManagementMobileViewProps {
  /** Constrains width to a mobile viewport frame when previewed on desktop */
  isStandalonePreview?: boolean;
}

function MobileKpiRightIcon({
  iconType,
}: {
  iconType: MobileVehicleMetric["iconType"];
}) {
  switch (iconType) {
    case "car":
      return (
        <div className="w-11 h-11 rounded-xl bg-[#EEF3F9] text-primary flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "scan":
      return (
        <div className="w-11 h-11 rounded-xl bg-[#EEF3F9] text-primary flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "entry":
      return (
        <div className="w-11 h-11 rounded-xl bg-[#EEF3F9] text-primary flex items-center justify-center shrink-0">
          <LogIn className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
  }
}

export function VehicleManagementMobileView({
  isStandalonePreview = false,
}: VehicleManagementMobileViewProps) {
  const api = useVehicles();
  const scanners: MobileScannerItem[] = api.data.scanners;
  const vehicles = api.data.mobileDirectory;
  const [searchPlates, setSearchPlates] = useState("");
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filteredVehicles = useMemo(() => {
    const q = searchPlates.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        v.make_color.toLowerCase().includes(q) ||
        v.owner_display.toLowerCase().includes(q) ||
        v.sub_info.toLowerCase().includes(q)
    );
  }, [vehicles, searchPlates]);

  const displayedVehicles = showAllVehicles
    ? filteredVehicles
    : filteredVehicles.slice(0, 3);

  const handleToggleScanner = (id: string) => {
    const sc = api.data.scanners.find((x) => x.id === id);
    if (sc) void api.setScannerEnabled(id, sc.offline_label === "DISABLED");
  };

  const handleToggleBadge = (id: number) => {
    const v = vehicles.find((x) => x.id === id);
    if (v) void api.patch(id, { owner_role: v.badge === "RESIDENT" ? "Visitor" : "Resident" });
    setOpenMenuId(null);
  };

  const handleRemoveVehicle = (id: number) => {
    void api.remove(id);
    setOpenMenuId(null);
  };

  return (
    <div
      className={cn(
        "space-y-5 pb-8 animate-in fade-in duration-300",
        isStandalonePreview && "max-w-[430px] mx-auto"
      )}
    >
      {api.error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{api.error}</div>
      )}
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight">
          Vehicle Management
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-primary mt-1 leading-relaxed">
          Monitor registered vehicles and scanner status across the estate.
        </p>
      </div>

      {/* ================= 3 STACKED HORIZONTAL KPI CARDS ================= */}
      <div className="space-y-3">
        {api.data.mobileMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-surface-card rounded-2xl border border-border/80 px-5 py-4 shadow-2xs flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-[11px] font-extrabold text-accent">
                {metric.label}
              </div>
              <div className="text-2xl font-extrabold text-dark tracking-tight mt-0.5">
                {metric.value}
              </div>
            </div>

            <MobileKpiRightIcon iconType={metric.iconType} />
          </div>
        ))}
      </div>

      {/* ================= GATE SCANNER STATUS SECTION ================= */}
      <div className="space-y-3 pt-1">
        <h2 className="text-base font-extrabold text-dark tracking-tight">
          Gate Scanner Status
        </h2>

        <div className="space-y-2.5">
          {scanners.map((scanner) => (
            <div
              key={scanner.id}
              onClick={() => handleToggleScanner(scanner.id)}
              title="Tap to toggle scanner status"
              className="bg-surface-card rounded-2xl border border-border/80 px-4 py-3.5 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:border-border transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-accent-light/70 text-primary flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-dark truncate">
                    {scanner.name}
                  </div>
                  <div className="text-[11px] font-semibold text-accent mt-0.5 truncate">
                    {scanner.last_ping}
                  </div>
                </div>
              </div>

              {scanner.online ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-light text-accent shrink-0">
                  ONLINE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-light text-primary shrink-0">
                  OFFLINE
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= VEHICLE DIRECTORY SECTION ================= */}
      <div className="space-y-3.5 pt-1">
        {/* Header + Search plates... input */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-dark tracking-tight shrink-0">
            Vehicle Directory
          </h2>

          <div className="relative flex-1 max-w-[190px]">
            <Search className="w-3.5 h-3.5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.3]" />
            <input
              type="text"
              value={searchPlates}
              onChange={(e) => setSearchPlates(e.target.value)}
              placeholder="Search plates..."
              aria-label="Search vehicle plates"
              className="w-full rounded-full bg-[#EFF4F3] focus:bg-white pl-8 pr-3 py-1.5 text-xs text-dark placeholder:text-muted font-medium border border-transparent focus:border-primary/40 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Left-Bordered Vehicle Cards */}
        <div className="space-y-3">
          {displayedVehicles.length === 0 ? (
            <div className="bg-surface-card rounded-2xl border border-border/80 p-8 text-center text-xs text-muted font-medium">
              No vehicles match &ldquo;{searchPlates}&rdquo;.
            </div>
          ) : (
            displayedVehicles.map((v) => {
              const isVisitor = v.badge === "VISITOR";
              const isMenuOpen = openMenuId === v.id;

              return (
                <div
                  key={v.id}
                  className={cn(
                    "bg-surface-card rounded-2xl border border-border/80 border-l-4 p-4 shadow-2xs space-y-3 relative",
                    isVisitor ? "border-l-primary" : "border-l-accent"
                  )}
                >
                  {/* Top Row: Plate + Make/Color + Category Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-extrabold text-dark tracking-tight">
                        {v.plate}
                      </div>
                      <div className="text-xs font-bold text-accent mt-0.5">
                        {v.make_color}
                      </div>
                    </div>

                    {isVisitor ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-primary-light text-primary">
                        VISITOR
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#E4E9F2] text-dark">
                        RESIDENT
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/60" />

                  {/* Bottom Row: Owner + Location/Time + 3-Dot Action Menu */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold text-dark/90 truncate">
                        {v.owner_display}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        {v.sub_icon === "home" ? (
                          <Home className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                        )}
                        <span className="truncate">{v.sub_info}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(isMenuOpen ? null : v.id)
                        }
                        aria-label={`Actions for ${v.plate}`}
                        className="p-1.5 rounded-lg text-primary hover:bg-surface-subtle transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-8 z-20 w-40 bg-surface-card rounded-xl border border-border shadow-lg py-1 text-left">
                            <button
                              type="button"
                              onClick={() => handleToggleBadge(v.id)}
                              className="w-full px-3 py-2 text-xs font-bold text-dark hover:bg-surface-subtle flex items-center gap-2"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                              <span>Switch Role</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVehicle(v.id)}
                              className="w-full px-3 py-2 text-xs font-bold text-primary hover:bg-primary-light/50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Pass</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => setShowAllVehicles(!showAllVehicles)}
            className="text-xs font-extrabold text-primary hover:text-primary-hover hover:underline transition-colors"
          >
            {showAllVehicles ? "Show Less" : "Load More"}
          </button>
        </div>
      </div>

      {/* ================= CORPORATE FOOTER ================= */}
      <footer className="pt-6 border-t border-border/60 text-center text-[11px] text-muted leading-relaxed">
        <p>© 2024 LincolnEstate Corporate. All rights reserved. Built for secure property management.</p>
      </footer>
    </div>
  );
}
