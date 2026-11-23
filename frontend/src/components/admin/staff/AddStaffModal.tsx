"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Trash2 } from "lucide-react";
import { StaffMember, StaffStatus } from "@/types/admin/staff";

export type StaffModalMode = "add" | "edit" | "view" | "delete" | null;

interface AddStaffModalProps {
  mode: StaffModalMode;
  member: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<StaffMember>) => void;
  onDelete?: (id: number) => void;
}

const roleSuggestions = [
  "Senior Property Consultant",
  "Financial Operations",
  "Legal Counsel",
  "Marketing Lead",
  "Maintenance Supervisor",
  "Tenant Liaison",
  "Security Operations Lead",
  "Facility Coordinator",
];

const departmentOptions = [
  "Operations",
  "Finance",
  "Legal & Compliance",
  "Marketing",
  "Facility Management",
  "Resident Relations",
  "Security & Logistics",
];

export function AddStaffModal({
  mode,
  member,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    job_title: "Senior Property Consultant",
    department: "Operations",
    staff_id: "",
    status: "active" as StaffStatus,
  });

  useEffect(() => {
    if (member && (mode === "edit" || mode === "view")) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || "",
        job_title: member.job_title,
        department: member.department || "Operations",
        staff_id: member.staff_id,
        status: member.status,
      });
    } else if (mode === "add") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        job_title: "Senior Property Consultant",
        department: "Operations",
        staff_id: `#LE-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "active",
      });
    }
  }, [member, mode]);

  if (!isOpen || !mode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-border overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle/50">
          <h2 className="font-extrabold text-lg text-dark">
            {mode === "add" && "Create New Staff Member"}
            {mode === "edit" && "Edit Staff Profile"}
            {mode === "view" && "Staff Member Overview"}
            {mode === "delete" && "Remove Staff Member"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* ================= ADD / EDIT FORM ================= */}
          {(mode === "add" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-[#00A859] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="s.jenkins@lincolnestate.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-[#00A859] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-[#00A859] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    list="role-list"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="Senior Property Consultant"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-[#00A859] focus:outline-none"
                  />
                  <datalist id="role-list">
                    {roleSuggestions.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-[#00A859] focus:outline-none bg-white font-medium"
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Staff ID Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    placeholder="#LE-4492"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark font-mono font-bold focus:ring-2 focus:ring-[#00A859] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-[#00A859] focus:outline-none bg-white font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-dark hover:bg-surface-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00A859] hover:bg-[#088f4e] text-white text-sm font-bold shadow-sm transition-colors"
                >
                  {mode === "add" ? "Save Staff Member" : "Update Profile"}
                </button>
              </div>
            </form>
          )}

          {/* ================= VIEW PROFILE ================= */}
          {mode === "view" && member && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {member.avatar_url && !member.avatar_url.includes("ui-avatars") ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border">
                    <Image
                      src={member.avatar_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#00A859] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-xl text-dark">{member.name}</h3>
                  <div className="text-xs font-semibold text-muted mt-0.5">
                    ID: {member.staff_id}
                  </div>
                  <div className="text-xs font-bold text-[#00A859] mt-1">
                    {member.job_title}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-surface-subtle/50 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Department</span>
                  <div className="font-semibold text-dark mt-0.5">{member.department || "Operations"}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Status</span>
                  <div className="font-bold text-[#00A859] mt-0.5 uppercase">{member.status}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Email</span>
                  <div className="font-medium text-dark mt-0.5 truncate">{member.email}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Phone</span>
                  <div className="font-medium text-dark mt-0.5">{member.phone || "—"}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#00A859] text-white text-sm font-bold shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ================= DELETE CONFIRMATION ================= */}
          {mode === "delete" && member && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-brand-crimson">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-brand-crimson" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-base">Remove Staff Member</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Are you sure you want to delete <span className="font-bold text-dark">{member.name}</span> ({member.staff_id})?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-dark hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete?.(member.id);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-brand-crimson hover:bg-[#991B1B] text-white text-xs font-bold shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
