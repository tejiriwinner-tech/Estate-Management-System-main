"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface StaffsZebraListViewProps {
  members: StaffMember[];
  totalCount?: number;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  onCreateNewStaff?: () => void;
}

export function StaffsZebraListView({
  members,
  totalCount = 120,
  onEdit,
  onDelete,
  onCreateNewStaff,
}: StaffsZebraListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.staff_id.toLowerCase().includes(q) ||
        m.job_title.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  return (
    <div className="bg-surface-card rounded-2xl border border-border/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Top Bar: Create New Staff button (optional) + Right-Aligned Search Input */}
      <div className="px-4 sm:px-8 py-4 sm:py-5 bg-surface-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          {onCreateNewStaff && (
            <button
              type="button"
              onClick={onCreateNewStaff}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 stroke-[2.2]" />
              <span>Create New Staff</span>
            </button>
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search staff list"
          className="w-full sm:w-80 md:w-96 px-4 py-2 rounded-lg border border-border text-sm text-dark placeholder:text-muted/80 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* ================= DESKTOP & TABLET ZEBRA TABLE (sm and up) ================= */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#EAEAEA] text-dark text-sm sm:text-base font-medium">
              <th className="py-3.5 pl-8 pr-4 text-left w-1/3">Staff name</th>
              <th className="py-3.5 px-4 text-center w-1/5">Staff ID</th>
              <th className="py-3.5 px-4 text-center w-1/4">Role</th>
              <th className="py-3.5 pl-4 pr-8 text-center w-1/5">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted font-medium"
                >
                  No staff members match &ldquo;{searchQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member, idx) => {
                const isStriped = idx % 2 === 1;
                return (
                  <tr
                    key={member.id}
                    className={cn(
                      "text-sm sm:text-base text-dark transition-colors hover:bg-primary-light/15",
                      isStriped ? "bg-[#EAEAEA]" : "bg-surface-card"
                    )}
                  >
                    {/* Staff name */}
                    <td className="py-3.5 pl-8 pr-4 text-left font-normal">
                      <Link
                        href={`/admin/staffs/${member.id}`}
                        className="text-dark hover:text-primary hover:underline transition-colors"
                      >
                        {member.name}
                      </Link>
                    </td>

                    {/* Staff ID */}
                    <td className="py-3.5 px-4 text-center font-normal text-dark">
                      {member.staff_id}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 text-center font-normal text-dark">
                      {member.job_title}
                    </td>

                    {/* Action: Circular Edit + Rounded-Rect Delete */}
                    <td className="py-3 pl-4 pr-8">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => onEdit(member)}
                          title={`Edit ${member.name}`}
                          aria-label={`Edit ${member.name}`}
                          className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105 active:scale-95"
                        >
                          <Pencil className="w-4 h-4 stroke-[2.2]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(member)}
                          title={`Delete ${member.name}`}
                          aria-label={`Delete ${member.name}`}
                          className="w-14 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE RESPONSIVE ZEBRA CARDS (< sm) ================= */}
      <div className="sm:hidden border-t border-border/60">
        {filteredMembers.length === 0 ? (
          <div className="py-10 px-4 text-center text-sm text-muted font-medium">
            No staff members match &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredMembers.map((member, idx) => {
            const isStriped = idx % 2 === 1;
            return (
              <div
                key={member.id}
                className={cn(
                  "px-4 py-3.5 flex items-center justify-between gap-3",
                  isStriped ? "bg-[#EAEAEA]" : "bg-surface-card"
                )}
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/staffs/${member.id}`}
                    className="block font-bold text-dark text-sm hover:text-primary truncate"
                  >
                    {member.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted font-medium mt-0.5">
                    <span>{member.staff_id}</span>
                    <span>•</span>
                    <span className="text-dark/80 truncate">{member.job_title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(member)}
                    aria-label={`Edit ${member.name}`}
                    className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-2xs"
                  >
                    <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(member)}
                    aria-label={`Delete ${member.name}`}
                    className="w-12 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer ("8 of 120") */}
      <div className="px-4 sm:px-8 py-4 bg-surface-card border-t border-border/50 flex items-center justify-between">
        <span className="text-sm sm:text-base font-normal text-dark">
          {searchQuery.trim() ? `${filteredMembers.length} of ${totalCount}` : `8 of ${totalCount}`}
        </span>
      </div>
    </div>
  );
}
