"use client";

import React, { useState } from "react";
import { UserPlus, Trash2, Search, Filter } from "lucide-react";
import { DeleteStaffModal } from "@/components/modals/DeleteStaffModal";
import { StaffMember } from "@/types/staff";

const initialStaffList: StaffMember[] = [
  {
    id: "1",
    name: "Bessie Cooper",
    role: "Senior Property Manager",
    code: "#LE-2940",
    isOnline: true,
    email: "bessie.cooper@lincolnestate.ng",
    department: "Operations",
  },
  {
    id: "2",
    name: "Darlene Robertson",
    role: "Chief Financial Officer",
    code: "#LE-1822",
    isOnline: true,
    email: "darlene.r@lincolnestate.ng",
    department: "Finance & Accounts",
  },
  {
    id: "3",
    name: "Floyd Miles",
    role: "Facility Maintenance Lead",
    code: "#LE-3410",
    isOnline: false,
    email: "floyd.m@lincolnestate.ng",
    department: "Maintenance",
  },
  {
    id: "4",
    name: "Eleanor Pena",
    role: "Billing & Collections Officer",
    code: "#LE-4491",
    isOnline: true,
    email: "eleanor.p@lincolnestate.ng",
    department: "Finance & Accounts",
  },
];

export default function StaffsPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaffList);
  // Default to showing the Bessie Cooper delete modal as captured in Figma
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(initialStaffList[0]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async (staffId: string) => {
    setIsDeleting(true);
    // Simulating API call to Laravel backend
    setTimeout(() => {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      setIsDeleting(false);
      setIsModalOpen(false);
      setSelectedStaff(null);
    }, 600);
  };

  const handleOpenDelete = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Staff Management
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage estate administrators, finance officers, and facility managers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Staff Listing Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, role, ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3">STAFF MEMBER</th>
                <th className="pb-3">DEPARTMENT</th>
                <th className="pb-3">STAFF ID</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        {staff.isOnline && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{staff.name}</p>
                        <p className="text-xs text-slate-400">{staff.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-xs font-medium text-slate-600">
                    {staff.department}
                  </td>
                  <td className="py-4 text-xs font-semibold text-slate-700">
                    {staff.code}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        staff.isOnline
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {staff.isOnline ? "Active" : "Offline"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(staff)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Staff"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal matching Figma */}
      <DeleteStaffModal
        isOpen={isModalOpen}
        staff={selectedStaff}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
