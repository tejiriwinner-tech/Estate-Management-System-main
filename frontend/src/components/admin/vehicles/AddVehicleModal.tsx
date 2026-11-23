"use client";

import React, { useState, useEffect } from "react";
import { X, Car } from "lucide-react";
import {
  VehicleOwnerRole,
  VehicleRecord,
  VehicleStatus,
} from "@/types/admin/vehicle";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (vehicle: Omit<VehicleRecord, "id">) => void;
}

export function AddVehicleModal({
  isOpen,
  onClose,
  onAdd,
}: AddVehicleModalProps) {
  const [ownerName, setOwnerName] = useState("");
  const [ownerRole, setOwnerRole] = useState<VehicleOwnerRole>("Resident");
  const [houseUnit, setHouseUnit] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("active");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOwnerName("");
      setOwnerRole("Resident");
      setHouseUnit("");
      setVehicleType("");
      setPlateNumber("");
      setStatus("active");
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !plateNumber.trim()) {
      setErrorMsg("Please enter both Owner Name and Plate Number.");
      return;
    }

    const cleanName = ownerName.trim();
    const initials = cleanName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    onAdd({
      initials: initials || "VH",
      owner_name: cleanName,
      owner_role: ownerRole,
      house_unit: houseUnit.trim() || "Villa A-101",
      vehicle_type: vehicleType.trim() || "Sedan - Toyota Camry",
      plate_number: plateNumber.trim().toUpperCase(),
      status,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-light/70 text-primary flex items-center justify-center">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-dark">
                Register New Vehicle
              </h3>
              <p className="text-xs text-muted font-medium">
                Enroll a vehicle for ANPR automated gate access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="px-3.5 py-2 rounded-xl bg-primary-light text-primary text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Owner Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Marcus Holloway"
                className="w-full rounded-xl border border-border bg-[#F4F6F9] focus:bg-white px-3.5 py-2.5 text-sm font-medium text-dark focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Owner Type
              </label>
              <select
                value={ownerRole}
                onChange={(e) =>
                  setOwnerRole(e.target.value as VehicleOwnerRole)
                }
                className="w-full rounded-xl border border-border bg-[#F4F6F9] px-3.5 py-2.5 text-sm font-semibold text-dark focus:border-primary focus:outline-none"
              >
                <option value="Resident">Resident</option>
                <option value="Vendor">Vendor</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                House / Unit
              </label>
              <input
                type="text"
                value={houseUnit}
                onChange={(e) => setHouseUnit(e.target.value)}
                placeholder="e.g. Villa A-402"
                className="w-full rounded-xl border border-border bg-[#F4F6F9] focus:bg-white px-3.5 py-2.5 text-sm font-medium text-dark focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Plate Number
              </label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. LND - 234 - XG"
                className="w-full rounded-xl border border-border bg-[#F4F6F9] focus:bg-white px-3.5 py-2.5 text-sm font-bold text-dark uppercase focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Vehicle Make & Model
              </label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. SUV - Toyota Land Cruiser"
                className="w-full rounded-xl border border-border bg-[#F4F6F9] focus:bg-white px-3.5 py-2.5 text-sm font-medium text-dark focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Pass Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                className="w-full rounded-xl border border-border bg-[#F4F6F9] px-3.5 py-2.5 text-sm font-semibold text-dark focus:border-primary focus:outline-none"
              >
                <option value="active">Active (Auto-Barrier)</option>
                <option value="pending">Pending Verification</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-bold text-dark hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
