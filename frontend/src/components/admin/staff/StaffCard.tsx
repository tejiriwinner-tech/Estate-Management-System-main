"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface StaffCardProps {
  member: StaffMember;
  onView: (member: StaffMember) => void;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

export function StaffCard({ member, onView, onEdit, onDelete }: StaffCardProps) {
  const isActive = member.status === "active";

  return (
    <div
      className={cn(
        "bg-surface-card rounded-2xl p-5 border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group",
        !isActive && "border-l-4 border-l-primary"
      )}
    >
      <div>
        {/* Top: Avatar & Status Badge */}
        <div className="flex items-start justify-between">
          {member.avatar_url && !member.avatar_url.includes("ui-avatars") ? (
            <div
              className={cn(
                "relative w-12 h-12 rounded-full overflow-hidden border border-border shadow-xs",
                !isActive && "grayscale opacity-85"
              )}
            >
              <Image
                src={member.avatar_url}
                alt={member.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm text-white shadow-xs",
                isActive ? "bg-dark" : "bg-primary"
              )}
            >
              {member.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          )}

          {/* Status Pill Badge */}
          {member.status === "active" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-light text-accent tracking-wider uppercase">
              ACTIVE
            </span>
          ) : member.status === "on_leave" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9EDF5] text-[#4A5568] tracking-wider uppercase">
              ON LEAVE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary tracking-wider uppercase">
              SUSPENDED
            </span>
          )}
        </div>

        {/* Middle Info */}
        <div className="mt-3.5">
          <Link
            href={`/admin/staffs/${member.id}`}
            className="block font-extrabold text-dark text-base tracking-tight group-hover:text-primary hover:underline transition-colors truncate"
          >
            {member.name}
          </Link>
          <div className="text-xs text-muted font-medium mt-0.5">
            ID: {member.staff_id}
          </div>
          <div className="text-xs text-dark font-semibold mt-2.5 truncate">
            {member.job_title}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60 text-muted">
        <button
          onClick={() => onView(member)}
          className="p-1.5 rounded-lg hover:text-dark hover:bg-surface-subtle transition-colors"
          title="View profile"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEdit(member)}
          className="p-1.5 rounded-lg hover:text-accent hover:bg-surface-subtle transition-colors"
          title="Edit staff details"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(member)}
          className="p-1.5 rounded-lg hover:text-primary hover:bg-primary-light transition-colors"
          title="Delete staff"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
