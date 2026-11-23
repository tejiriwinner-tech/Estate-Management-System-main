"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  EstateServiceItem,
  ServiceFrequency,
  ServiceStatus,
} from "@/types/serviceManagement";

interface AddServiceModalProps {
  isOpen: boolean;
  editingService: EstateServiceItem | null;
  onClose: () => void;
  onSave: (serviceData: Omit<EstateServiceItem, "id" | "dateCreated">) => void;
}

export function AddServiceModal({
  isOpen,
  editingService,
  onClose,
  onSave,
}: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [fee, setFee] = useState("25000");
  const [frequency, setFrequency] = useState<ServiceFrequency>("Monthly");
  const [status, setStatus] = useState<ServiceStatus>("Active");

  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setCategory(editingService.category);
      setFee(String(editingService.fee));
      setFrequency(editingService.frequency);
      setStatus(editingService.status);
    } else {
      setName("");
      setCategory("Utilities");
      setFee("25000");
      setFrequency("Monthly");
      setStatus("Active");
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category: category.trim(),
      fee: Number(fee) || 0,
      frequency,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-dark/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-dark">
            {editingService ? "Edit Estate Service" : "Add New Estate Service"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-dark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-dark mb-1.5">
              Service Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Water Treatment Levy"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-dark mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="Estate Security">Estate Security</option>
                <option value="Utilities">Utilities</option>
                <option value="General">General</option>
                <option value="Landscaping">Landscaping</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-dark mb-1.5">
                Service Fee (₦)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-dark mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as ServiceFrequency)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="One-Time">One-Time</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-dark mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary hover:bg-primary-hover px-5 py-2 font-bold text-white shadow-sm shadow-primary/20 cursor-pointer"
            >
              {editingService ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
