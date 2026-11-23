"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Search, Filter } from "lucide-react";
import { DeleteStaffModal } from "@/components/modals/DeleteStaffModal";
import { StaffMember } from "@/types/staff";
import { staffApi } from "@/lib/admin/staffApi";

export default function StaffsPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStaff = useCallback(async () => {
    try {
      const data = await staffApi.list();
      const mapped: StaffMember[] = data.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        role: s.job_title || s.role,
        code: s.staff_id || `#LE-${s.id}`,
        isOnline: s.status === "active",
        email: s.email,
        department: s.department || "Operations",
      }));
      setStaffList(mapped);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleDeleteConfirm = async (staffId: string) => {
    setIsDeleting(true);
    try {
      await staffApi.remove(Number(staffId));
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    } catch {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setSelectedStaff(null);
    }
  };

  const handleOpenDelete = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage estate employees, operational staff, and security personnel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/staffs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage All Staff</span>
          </a>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, department, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading staff directory...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {staff.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                      staff.isOnline ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        staff.isOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    {staff.isOnline ? "Active" : "Away"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                <p className="text-xs text-primary font-semibold mt-0.5">{staff.role}</p>
                <p className="text-xs text-slate-500 mt-2">{staff.department}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{staff.email}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => handleOpenDelete(staff)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteStaffModal
        isOpen={isModalOpen}
        staff={selectedStaff}
        isDeleting={isDeleting}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(id) => handleDeleteConfirm(id)}
      />
    </div>
  );
}
