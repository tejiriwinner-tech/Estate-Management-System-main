"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ListFilter,
  Plus,
  Car,
  ClipboardCheck,
  Ban,
} from "lucide-react";
import { useVehicles } from "@/lib/admin/vehicleApi";
import {
  VehicleMetricItem,
  VehicleOwnerRole,
  VehicleRecord,
  VehicleStatus,
} from "@/types/admin/vehicle";
import { VehicleDirectoryCard } from "./VehicleDirectoryCard";
import { ScannerStatusCard } from "./ScannerStatusCard";
import { AddVehicleModal } from "./AddVehicleModal";
import { VehicleManagementMobileView } from "./VehicleManagementMobileView";

function VehicleKpiIcon({
  iconType,
}: {
  iconType: VehicleMetricItem["iconType"];
}) {
  switch (iconType) {
    case "registered":
      return (
        <div className="w-12 h-12 rounded-full bg-accent-light/70 text-primary flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "visitor":
      return (
        <div className="w-12 h-12 rounded-full bg-accent-light/55 text-accent flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "pending":
      return (
        <div className="w-12 h-12 rounded-full bg-[#FEF6DF] text-accent flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "disabled":
      return (
        <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <Ban className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
  }
}

export function VehicleManagementView() {
  const api = useVehicles();
  const vehicles = api.data.vehicles;
  const metrics = api.data.metrics;
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | "all">(
    "all"
  );
  const [selectedRole, setSelectedRole] = useState<VehicleOwnerRole | "all">(
    "all"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesStatus =
        selectedStatus === "all" || v.status === selectedStatus;
      const matchesRole =
        selectedRole === "all" || v.owner_role === selectedRole;
      return matchesStatus && matchesRole;
    });
  }, [vehicles, selectedStatus, selectedRole]);

  const handleAddVehicle = (v: Omit<VehicleRecord, "id">) => {
    void api.add({
      owner_name: v.owner_name,
      owner_role: v.owner_role,
      house_unit: v.house_unit || undefined,
      vehicle_type: v.vehicle_type,
      plate_number: v.plate_number,
      status: v.status,
    });
  };

  const handleCycleVehicleStatus = (id: number) => {
    const cur = vehicles.find((v) => v.id === id);
    if (!cur) return;
    const next: VehicleStatus = cur.status === "active" ? "pending" : cur.status === "pending" ? "disabled" : "active";
    void api.patch(id, { status: next });
  };

  const totalRegisteredCount =
    metrics.find((m) => m.id === "registered")?.value ?? 0;

  return (
    <>
      {/* ================= AUTOMATIC MOBILE LAYOUT (< md) — TASK 14 ================= */}
      <div className="md:hidden">
        <VehicleManagementMobileView />
      </div>

      {/* ================= DESKTOP & TABLET LAYOUT (md+) — TASK 13 ================= */}
      <div className="hidden md:block space-y-6 animate-in fade-in duration-300 pb-6">
        {api.error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{api.error}</div>
        )}
        {/* ================= BREADCRUMB & HEADER ROW ================= */}
      <div className="space-y-1.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <Link
            href="/admin/dashboard"
            className="text-muted hover:text-dark transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted" />
          <span className="text-primary font-extrabold">
            Vehicle Management
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              Vehicle Management
            </h1>
            <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
              Manage estate vehicles, access logs, and monitor active scanners.
            </p>
          </div>

          {/* Right Action Buttons: Filter + Add Vehicle */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark shadow-2xs transition-colors"
              >
                <ListFilter className="w-4 h-4 text-dark/80 stroke-[2.2]" />
                <span>
                  {selectedStatus === "all" && selectedRole === "all"
                    ? "Filter"
                    : "Filtered"}
                </span>
              </button>

              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 w-56 bg-surface-card rounded-2xl border border-border shadow-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                        Pass Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value as VehicleStatus | "all"
                          )
                        }
                        className="w-full rounded-xl border border-border bg-[#F4F6F9] px-3 py-2 text-xs font-bold text-dark focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                        Owner Type
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRole(
                            e.target.value as VehicleOwnerRole | "all"
                          )
                        }
                        className="w-full rounded-xl border border-border bg-[#F4F6F9] px-3 py-2 text-xs font-bold text-dark focus:outline-none"
                      >
                        <option value="all">All Owners</option>
                        <option value="Resident">Resident</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Visitor">Visitor</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatus("all");
                        setSelectedRole("all");
                        setIsFilterOpen(false);
                      }}
                      className="w-full py-1 text-xs font-bold text-primary hover:underline text-center"
                    >
                      Reset Filters
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 4 HORIZONTAL KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="bg-surface-card rounded-2xl border border-border/70 px-5 py-5 shadow-xs flex items-center gap-4"
          >
            <VehicleKpiIcon iconType={m.iconType} />
            <div>
              <div className="text-xs font-bold text-dark/80">{m.label}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mt-0.5">
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= LOWER 12-COLUMN SPLIT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Vehicle Directory */}
        <div className="lg:col-span-8">
          <VehicleDirectoryCard
            vehicles={filteredVehicles}
            totalRegisteredCount={totalRegisteredCount}
            onToggleStatus={handleCycleVehicleStatus}
          />
        </div>

        {/* Right 4 Columns: Scanner Status & Automated Access */}
        <div className="lg:col-span-4">
          <ScannerStatusCard feeds={api.data.scanners} onRefresh={api.reload} onToggle={(id, enabled) => api.setScannerEnabled(id, enabled)} />
        </div>
      </div>

      {/* ================= BOTTOM CORPORATE FOOTER ================= */}
      <footer className="pt-6 border-t border-border/70 text-center text-xs text-muted font-medium">
        © 2024 LincolnEstate Corporate. All rights reserved. Built for secure
        property management.
      </footer>

      {/* ================= ADD VEHICLE MODAL ================= */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVehicle}
      />
      </div>
    </>
  );
}
