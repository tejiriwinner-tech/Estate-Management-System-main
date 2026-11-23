"use client";

import React from "react";
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/admin/utils";

interface UserFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  onToggleFilterModal?: () => void;
}

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "all_staff", label: "All Staff" },
  { value: "managers", label: "Managers" },
  { value: "agents", label: "Agents" },
  { value: "maintenance", label: "Maintenance" },
  { value: "residents", label: "Residents" },
  { value: "security", label: "Security" },
];

const mobilePills = [
  { value: "all_staff", label: "All Staff" },
  { value: "managers", label: "Managers" },
  { value: "agents", label: "Agents" },
  { value: "maintenance", label: "Maintenance" },
  { value: "residents", label: "Residents" },
];

export function UserFilterBar({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  onToggleFilterModal,
}: UserFilterBarProps) {
  return (
    <div className="space-y-3.5">
      {/* Search and Dropdowns Container */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, house, ID, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-card text-sm text-dark placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Desktop Controls (Role Select & Filter Button) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Role Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface-card text-sm font-semibold text-dark hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm transition-colors"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>

          {/* Filter Sliders Button */}
          <button
            onClick={onToggleFilterModal}
            className="p-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-muted hover:text-dark transition-colors shadow-sm"
            title="Filter options"
            aria-label="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Filter Pills */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        {mobilePills.map((pill) => {
          const isSelected =
            selectedRole === pill.value ||
            (pill.value === "all_staff" && (selectedRole === "all" || selectedRole === "all_staff" || !selectedRole));

          return (
            <button
              key={pill.value}
              onClick={() => onRoleChange(pill.value)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                isSelected
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-subtle text-dark hover:bg-border/60"
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
