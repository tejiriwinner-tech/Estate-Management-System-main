"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, UserPlus, List } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";

interface StaffHorizontalListViewProps {
  members: StaffMember[];
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  onCreateNewStaff: () => void;
  onViewAllStaff: () => void;
}

export function StaffHorizontalListView({
  members,
  onEdit,
  onDelete,
  onCreateNewStaff,
  onViewAllStaff,
}: StaffHorizontalListViewProps) {
  return (
    <div className="space-y-6">
      {/* Vertical Stack of Full-Width Horizontal Staff Row Cards */}
      <div className="space-y-4 sm:space-y-5">
        {members.length === 0 ? (
          <div className="bg-surface-card rounded-2xl border border-border/70 p-10 text-center text-muted font-medium">
            No staff members available. Click &ldquo;Create New Staff&rdquo; to add one.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="bg-surface-card rounded-2xl border border-border/60 shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] transition-all px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4"
            >
              {/* Left: Circular Avatar + Name & Staff Code (LES10, LES11, etc.) */}
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <Link
                  href={`/admin/staffs/${member.id}`}
                  className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-border shadow-xs shrink-0 hover:ring-2 hover:ring-primary/40 transition-all"
                >
                  {member.avatar_url && !member.avatar_url.includes("ui-avatars") ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 56px, 80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark text-white flex items-center justify-center text-base sm:text-xl font-extrabold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/admin/staffs/${member.id}`}
                    className="block text-base sm:text-2xl font-extrabold text-dark hover:text-primary transition-colors tracking-tight truncate"
                  >
                    {member.name}
                  </Link>
                  <p className="text-xs sm:text-base font-bold text-muted uppercase tracking-wide mt-0.5">
                    {member.staff_id}
                  </p>
                </div>
              </div>

              {/* Right: Circular Edit & Delete Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(member)}
                  title={`Edit ${member.name}`}
                  aria-label={`Edit ${member.name}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95"
                >
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(member)}
                  title={`Delete ${member.name}`}
                  aria-label={`Delete ${member.name}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Action Footer: Create New Staff (Left) & View All Staff (Right) */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onCreateNewStaff}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-lg font-extrabold shadow-sm transition-all active:scale-98"
        >
          <UserPlus className="w-5 h-5 stroke-[2.4]" />
          <span>Create New Staff</span>
        </button>

        <button
          type="button"
          onClick={onViewAllStaff}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-lg font-extrabold shadow-sm transition-all active:scale-98"
        >
          <List className="w-5 h-5 stroke-[2.4]" />
          <span>View All Staff</span>
        </button>
      </div>
    </div>
  );
}
