"use client";

import React from "react";
import { ListFilter, ChevronDown, X, Ban, CheckCircle2 } from "lucide-react";
import { StaffStatus } from "@/types/admin/staff";

interface StaffFilterBarProps {
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  selectedStatus: StaffStatus | "all";
  onStatusChange: (status: StaffStatus | "all") => void;
  departments: string[];
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusChange?: (status: StaffStatus) => void;
}

export function StaffFilterBar({
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  departments,
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
}: StaffFilterBarProps) {
  return (
    <div className="bg-surface-card border border-border/80 rounded-2xl px-4 sm:px-5 py-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Department Filter Pill */}
        <div className="relative flex items-center">
          <ListFilter className="w-3.5 h-3.5 text-dark/70 absolute left-3.5 pointer-events-none" />
          <select
            aria-label="Filter by Department"
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="appearance-none bg-[#F4F6F9] hover:bg-[#EBEEF3] text-dark text-xs sm:text-sm font-semibold pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-primary/40 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-dark/70 absolute right-3 pointer-events-none" />
        </div>

        {/* Status Filter Pill */}
        <div className="relative flex items-center">
          <select
            aria-label="Filter by Status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as StaffStatus | "all")}
            className="appearance-none bg-[#F4F6F9] hover:bg-[#EBEEF3] text-dark text-xs sm:text-sm font-semibold pl-4 pr-8 py-2 rounded-xl border border-transparent focus:border-primary/40 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-dark/70 absolute right-3 pointer-events-none" />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border mx-1 hidden xs:block" />

        {/* Selected Counter */}
        <div className="text-xs sm:text-sm font-medium text-muted flex items-center gap-1.5">
          <span>Selected:</span>
          <span className="font-extrabold text-accent">{selectedCount}</span>
        </div>
      </div>

      {/* Bulk Quick Actions when rows are selected */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          {onBulkStatusChange && (
            <>
              <button
                type="button"
                onClick={() => onBulkStatusChange("active")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-accent-light text-accent hover:bg-accent/20 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Set Active</span>
              </button>
              <button
                type="button"
                onClick={() => onBulkStatusChange("suspended")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-light text-primary hover:bg-primary/20 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted hover:text-dark hover:bg-surface-subtle transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
}
