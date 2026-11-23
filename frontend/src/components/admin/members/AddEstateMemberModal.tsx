"use client";

import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { EstateMemberRecord } from "@/types/admin/member";

interface AddEstateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (payload: Omit<EstateMemberRecord, "id">) => void;
}

export function AddEstateMemberModal({
  isOpen,
  onClose,
  onAddMember,
}: AddEstateMemberModalProps) {
  const [name, setName] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [dateMovedIn, setDateMovedIn] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || "David Onyemenam";
    const cleanHouseNo = houseNo.trim() || "EHN145";
    const cleanDate = dateMovedIn.trim() || "23-10-210";

    onAddMember({
      name: cleanName,
      house_no: cleanHouseNo,
      date_moved_in: cleanDate,
    });

    setName("");
    setHouseNo("");
    setDateMovedIn("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-estate-member-title"
        className="w-full max-w-md bg-surface-card rounded-2xl border border-border shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5" />
            <h2
              id="add-estate-member-title"
              className="text-base font-extrabold tracking-tight"
            >
              Add a Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="member-full-name"
              className="block text-xs font-extrabold text-dark"
            >
              Full Name
            </label>
            <input
              id="member-full-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. David Onyemenam"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-dark placeholder:text-muted/70 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="member-house-no"
                className="block text-xs font-extrabold text-dark"
              >
                House No
              </label>
              <input
                id="member-house-no"
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="e.g. EHN145"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-dark placeholder:text-muted/70 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="member-date-moved-in"
                className="block text-xs font-extrabold text-dark"
              >
                Date Moved In
              </label>
              <input
                id="member-date-moved-in"
                type="text"
                value={dateMovedIn}
                onChange={(e) => setDateMovedIn(e.target.value)}
                placeholder="e.g. 23-10-210"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-dark placeholder:text-muted/70 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-bold text-dark hover:bg-surface-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-extrabold shadow-xs transition-all"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
