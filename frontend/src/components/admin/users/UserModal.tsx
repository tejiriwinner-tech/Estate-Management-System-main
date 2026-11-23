"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Trash2, Ban } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/admin/user";

export type ModalMode = "add" | "edit" | "view" | "delete" | "suspend" | null;

interface UserModalProps {
  mode: ModalMode;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  onConfirmDelete?: (id: number) => void;
  onConfirmSuspend?: (id: number) => void;
}

export function UserModal({
  mode,
  user,
  isOpen,
  onClose,
  onSave,
  onConfirmDelete,
  onConfirmSuspend,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "resident" as UserRole,
    status: "active" as UserStatus,
    unit_number: "",
    job_title: "",
    staff_id: "",
  });

  useEffect(() => {
    if (user && (mode === "edit" || mode === "view")) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "resident",
        status: user.status || "active",
        unit_number: user.unit_number || "",
        job_title: user.job_title || "",
        staff_id: user.staff_id || "",
      });
    } else if (mode === "add") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "resident",
        status: "active",
        unit_number: "",
        job_title: "",
        staff_id: "",
      });
    }
  }, [user, mode]);

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
            {mode === "add" && "Add New User / Staff"}
            {mode === "edit" && "Edit User Details"}
            {mode === "view" && "User Profile Overview"}
            {mode === "delete" && "Confirm Deletion"}
            {mode === "suspend" && "Confirm Suspension"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none"
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
                    placeholder="s.jenkins@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Role Category *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="resident">Resident</option>
                    <option value="manager">Property Manager</option>
                    <option value="agent">Leasing Agent</option>
                    <option value="maintenance">Maintenance Tech</option>
                    <option value="security">Security Officer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    House / Unit No.
                  </label>
                  <input
                    type="text"
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                    placeholder="e.g. Villa A-402, Block B, 204"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark uppercase mb-1.5">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g. Senior Property Manager"
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-dark focus:ring-2 focus:ring-primary focus:outline-none"
                  />
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
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-sm transition-colors"
                >
                  {mode === "add" ? "Create Account" : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* ================= VIEW PROFILE ================= */}
          {mode === "view" && user && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {user.avatar_url && !user.avatar_url.includes("ui-avatars") ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border">
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-xl text-dark">{user.name}</h3>
                  <div className="text-xs font-semibold text-muted mt-0.5">
                    ID: {user.staff_id || user.unit_number || `USR-${user.id}`}
                  </div>
                  <div className="text-xs text-muted font-medium mt-1">
                    {user.job_title || "Resident"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-surface-subtle/50 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Email</span>
                  <div className="font-medium text-dark mt-0.5">{user.email}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Phone</span>
                  <div className="font-medium text-dark mt-0.5">{user.phone || "—"}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Unit / House</span>
                  <div className="font-medium text-dark mt-0.5">{user.unit_number || "—"}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Status</span>
                  <div className="font-bold text-primary mt-0.5 capitalize">{user.status}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ================= DELETE CONFIRMATION ================= */}
          {mode === "delete" && user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-primary">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-base">Delete User Account</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Are you sure you want to remove <span className="font-bold text-dark">{user.name}</span>? This action is permanent.
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
                    onConfirmDelete?.(user.id);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* ================= SUSPEND CONFIRMATION ================= */}
          {mode === "suspend" && user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-primary">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <Ban className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-base">Suspend User Account</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Temporarily revoke access for <span className="font-bold text-dark">{user.name}</span>.
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
                    onConfirmSuspend?.(user.id);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm"
                >
                  Suspend Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
