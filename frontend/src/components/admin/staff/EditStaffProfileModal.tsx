"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Camera, RotateCw, UserX, Trash2, ChevronDown, Check } from "lucide-react";
import { StaffMember, StaffStatus } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface EditStaffProfileModalProps {
  member: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<StaffMember>) => void;
  onDelete?: (id: number) => void;
  onResetPassword?: (id: number) => void;
}

const roleOptions = [
  "Property Manager",
  "Senior Property Manager",
  "Senior Property Consultant",
  "Financial Operations",
  "Legal Counsel",
  "Marketing Lead",
  "Maintenance Supervisor",
  "Tenant Liaison",
  "Security Operations",
];

const departmentOptions = [
  "Sales & Leasing",
  "Operations",
  "Finance",
  "Legal & Compliance",
  "Marketing",
  "Facility Management",
  "Resident Relations",
];

export function EditStaffProfileModal({
  member,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onResetPassword,
}: EditStaffProfileModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Property Manager",
    department: "Sales & Leasing",
    status: "active" as StaffStatus,
    avatar_url: "",
  });

  const [isDeactivated, setIsDeactivated] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "Bessie Cooper",
        email: member.email || "bessie.cooper@lincolnestate.com",
        phone: member.phone || "+1 (555) 902-3412",
        role: member.job_title || "Property Manager",
        department: member.department || "Sales & Leasing",
        status: member.status,
        avatar_url:
          member.avatar_url ||
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      });
      setIsDeactivated(member.status === "suspended");
      setResetMessage(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleToggleDeactivate = () => {
    const nextState = !isDeactivated;
    setIsDeactivated(nextState);
    setFormData((prev) => ({
      ...prev,
      status: nextState ? "suspended" : "active",
    }));
  };

  const handleTriggerResetPassword = () => {
    const tempPass = `LE-${Math.floor(100000 + Math.random() * 900000)}`;
    setResetMessage(`Temporary password generated: ${tempPass}`);
    onResetPassword?.(member.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      job_title: formData.role,
      department: formData.department,
      status: formData.status,
      avatar_url: formData.avatar_url,
    });
    onClose();
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormData((prev) => ({
            ...prev,
            avatar_url: uploadEvent.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-surface-card rounded-2xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col">
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/70">
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-dark tracking-tight">
              Edit Staff Profile
            </h2>
            <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
              Modify account details and permissions
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
          {/* Profile Header (Avatar + Camera + Name + Title + Reset Password) */}
          <div className="flex items-center gap-4 pb-5 border-b border-border/70">
            {/* Avatar with Camera Overlay */}
            <div className="relative shrink-0">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-border shadow-xs">
                <Image
                  src={formData.avatar_url}
                  alt={formData.name}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 ring-2 ring-white"
                title="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-dark truncate">
                {formData.name}
              </h3>
              <div className="text-xs text-muted font-medium mt-0.5 truncate">
                {formData.role}
              </div>

              {/* Reset Password Action */}
              <button
                type="button"
                onClick={handleTriggerResetPassword}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover mt-1.5 transition-colors group"
              >
                <RotateCw className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                <span>Reset Password</span>
              </button>

              {resetMessage && (
                <div className="text-[11px] font-bold text-primary mt-1 animate-in fade-in">
                  ✓ {resetMessage}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <form id="edit-staff-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: FULL NAME & ROLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bessie Cooper"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  ROLE
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs transition-all"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: EMAIL ADDRESS (full width) */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="bessie.cooper@lincolnestate.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
              />
            </div>

            {/* Row 3: PHONE NUMBER & DEPARTMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 902-3412"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  DEPARTMENT
                </label>
                <div className="relative">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface text-sm text-dark font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs transition-all"
                  >
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Deactivate Staff Member Box */}
            <div className="bg-[#FDF8EA]/60 border border-accent/30 rounded-2xl p-4 flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-border flex items-center justify-center text-accent shrink-0">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-dark">
                    Deactivate Staff Member
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted font-medium">
                    Temporarily disable access to the admin portal
                  </p>
                </div>
              </div>

              {/* iOS Style Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isDeactivated}
                onClick={handleToggleDeactivate}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  isDeactivated ? "bg-primary" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    isDeactivated ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </form>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-6 py-4 border-t border-border/70 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Remove Staff Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to remove ${member.name}?`)) {
                onDelete?.(member.id);
                onClose();
              }
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors order-2 sm:order-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Staff</span>
          </button>

          {/* Right: Discard & Save Changes Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark transition-colors shadow-xs"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              form="edit-staff-form"
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
