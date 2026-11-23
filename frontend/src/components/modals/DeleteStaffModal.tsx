"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { StaffMember } from "@/types/staff";

interface DeleteStaffModalProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
  onConfirm: (staffId: string) => void;
  isDeleting?: boolean;
}

export function DeleteStaffModal({
  isOpen,
  staff,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteStaffModalProps) {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[92vw] sm:max-w-[430px] rounded-2xl bg-white p-5 sm:p-6 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Warning Badge */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100/60">
            <AlertTriangle className="h-5 w-5 text-rose-600 fill-rose-600/20" />
          </div>
        </div>

        {/* Modal Header */}
        <div className="mt-4 text-center">
          <h3 className="text-base font-bold text-slate-800">
            Delete Staff Member
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{staff.name}</span>? This action cannot be undone.
          </p>
        </div>

        {/* Staff Entity Summary Card */}
        <div className="my-5 flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
              {staff.avatarUrl ? (
                <img
                  src={staff.avatarUrl}
                  alt={staff.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </div>
            {staff.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-800 truncate">
              {staff.name}
            </h4>
            <p className="text-xs text-slate-400 font-medium truncate">
              {staff.role} • ID: {staff.code}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(staff.id)}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 shadow-sm shadow-red-600/25 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Staff"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
