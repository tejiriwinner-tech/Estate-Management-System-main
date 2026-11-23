"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, UserPlus, Camera, Lock, ChevronDown, Info, Save } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStaffData: Partial<StaffMember>) => void;
  staffSequence?: number;
}

const departmentOptions = [
  "Sales & Leasing",
  "Operations",
  "Finance",
  "Legal & Compliance",
  "Marketing",
  "Facility Management",
  "Resident Relations",
  "Security & Logistics",
];

export function CreateStaffModal({
  isOpen,
  onClose,
  onSave,
  staffSequence = 1,
}: CreateStaffModalProps) {
  const currentYear = new Date().getFullYear();
  const formattedSeq = String(staffSequence).padStart(3, "0");
  const defaultStaffId = `LE - ${currentYear} - ${formattedSeq}`;

  const [fullName, setFullName] = useState("");
  const [staffId, setStaffId] = useState(defaultStaffId);
  const [workEmail, setWorkEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [roleDesignation, setRoleDesignation] = useState("");
  const [employmentType, setEmploymentType] = useState<"full_time" | "contract">("full_time");
  const [isActiveAccount, setIsActiveAccount] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarPreview(uploadEvent.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: fullName.trim(),
      staff_id: staffId.trim(),
      email: workEmail.trim(),
      phone: phoneNumber.trim() || null,
      department: department || "Operations",
      job_title: roleDesignation.trim() || "Operational Staff",
      employment_type: employmentType,
      status: isActiveAccount ? "active" : "suspended",
      avatar_url:
        avatarPreview ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fullName || "Staff"
        )}&background=B22222&color=fff&bold=true`,
    });

    // Reset form
    setFullName("");
    setWorkEmail("");
    setPhoneNumber("");
    setDepartment("");
    setRoleDesignation("");
    setAvatarPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-surface-card rounded-2xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col">
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/70">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-dark tracking-tight">
              Create New Staff
            </h2>
            <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
              Register a new employee to the LincolnEstate portal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-dark hover:bg-surface-subtle transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upload Profile Photo Area */}
          <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-border/70">
            <div className="relative">
              <label
                htmlFor="create-avatar-upload"
                className="relative w-22 h-22 rounded-full bg-[#EBF2FA] border-2 border-dashed border-border/80 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-primary transition-colors shadow-xs"
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                ) : (
                  <UserPlus className="w-8 h-8 text-muted/70 group-hover:text-primary transition-colors stroke-[1.8]" />
                )}
              </label>

              {/* Camera Badge Overlay at Bottom-Right */}
              <label
                htmlFor="create-avatar-upload"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 ring-2 ring-white"
                title="Upload photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="create-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>

            <h3 className="font-bold text-sm text-dark mt-3">
              Upload Profile Photo
            </h3>
            <p className="text-[11px] text-muted font-medium mt-0.5">
              Min 400x400px. JPG or PNG.
            </p>
          </div>

          {/* Form Inputs Grid */}
          <form id="create-staff-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: FULL NAME & STAFF ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jonathan Aris"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  STAFF ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="LE - 2024 - 001"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs transition-all"
                  />
                  <Lock className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: WORK EMAIL & PHONE NUMBER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  WORK EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="j.aris@lincolnestate.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1(555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Row 3: DEPARTMENT & ROLE / DESIGNATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  DEPARTMENT
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs transition-all"
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  ROLE / DESIGNATION
                </label>
                <input
                  type="text"
                  required
                  value={roleDesignation}
                  onChange={(e) => setRoleDesignation(e.target.value)}
                  placeholder="e.g. Property Manager"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Row 4: EMPLOYMENT TYPE & INITIAL STATUS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Employment Type Pills */}
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  EMPLOYMENT TYPE
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEmploymentType("full_time")}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs",
                      employmentType === "full_time"
                        ? "bg-primary text-white"
                        : "bg-surface border border-border text-dark hover:bg-surface-subtle"
                    )}
                  >
                    Full-time
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmploymentType("contract")}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs",
                      employmentType === "contract"
                        ? "bg-primary text-white"
                        : "bg-surface border border-border text-dark hover:bg-surface-subtle"
                    )}
                  >
                    Contract
                  </button>
                </div>
              </div>

              {/* Initial Status Switch */}
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  INITIAL STATUS
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActiveAccount}
                    onClick={() => setIsActiveAccount(!isActiveAccount)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isActiveAccount ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        isActiveAccount ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className="text-xs font-bold text-dark">
                    Active Account
                  </span>
                </div>
              </div>
            </div>

            {/* Onboarding Info Box */}
            <div className="bg-[#FDF8EA]/70 border border-accent/30 rounded-2xl p-4 flex items-start gap-3 mt-3">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-dark/90 leading-relaxed font-medium">
                By saving this staff member, an automated onboarding email will be sent to their work address with temporary login credentials for the portal.
              </p>
            </div>
          </form>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-6 py-4 border-t border-border/70 bg-surface flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark transition-colors shadow-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-staff-form"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Save className="w-4 h-4 stroke-[2.2]" />
            <span>Save Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
}
