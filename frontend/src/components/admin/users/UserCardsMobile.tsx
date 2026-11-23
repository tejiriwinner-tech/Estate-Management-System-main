"use client";

import React from "react";
import Image from "next/image";
import { Briefcase, Mail, Clock, MoreVertical, Check } from "lucide-react";
import { User } from "@/types/admin/user";
import { cn } from "@/lib/admin/utils";

interface UserCardsMobileProps {
  users: User[];
  onEdit: (user: User) => void;
  onSuspend: (user: User) => void;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  onReactivate: (user: User) => void;
  onView: (user: User) => void;
}

export function UserCardsMobile({
  users,
  onEdit,
  onSuspend,
  onApprove,
  onReject,
  onReactivate,
  onView,
}: UserCardsMobileProps) {
  if (users.length === 0) {
    return (
      <div className="bg-surface-card rounded-2xl p-8 border border-border text-center text-muted text-sm shadow-sm">
        No staff or users found matching this filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const isPending = user.status === "pending";
        const isSuspended = user.status === "suspended";
        const isActive = user.status === "active";

        return (
          <div
            key={user.id}
            className={cn(
              "bg-surface-card rounded-2xl p-5 border border-border shadow-sm transition-all",
              (isPending || isSuspended) && "border-l-4 border-l-primary"
            )}
          >
            {/* Top row: Avatar + Name + Status Badge */}
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              {user.avatar_url && !user.avatar_url.includes("ui-avatars") ? (
                <div
                  className={cn(
                    "relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-border",
                    isSuspended && "grayscale contrast-125 opacity-80"
                  )}
                >
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
                    isPending
                      ? "bg-accent-light text-accent"
                      : isSuspended
                      ? "bg-primary-light text-primary"
                      : "bg-dark text-white"
                  )}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}

              {/* User Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-dark text-base truncate">
                    {user.name}
                  </h3>
                  {/* Status Badge */}
                  {isActive && (
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-light text-accent tracking-wider uppercase">
                      ACTIVE
                    </span>
                  )}
                  {isPending && (
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary bg-primary-light tracking-wider uppercase">
                      PENDING
                    </span>
                  )}
                  {isSuspended && (
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary bg-primary-light tracking-wider uppercase">
                      SUSPENDED
                    </span>
                  )}
                </div>

                {/* Staff ID */}
                <div className="text-xs font-semibold text-muted mt-0.5">
                  ID: {user.staff_id || (user.unit_number ? user.unit_number : `RES-${user.id}`)}
                </div>

                {/* Job Title / Role */}
                {user.job_title && (
                  <div className="flex items-center gap-2 text-xs text-dark font-medium mt-2">
                    <Briefcase className="w-3.5 h-3.5 shrink-0 text-accent" />
                    <span className="truncate">{user.job_title}</span>
                  </div>
                )}

                {/* Email (Active) or Requested Date (Pending) */}
                {isPending ? (
                  <div className="flex items-center gap-2 text-xs text-muted font-medium mt-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-accent" />
                    <span>Requested: Oct 24, 2024</span>
                  </div>
                ) : (
                  user.email && (
                    <div className="flex items-center gap-2 text-xs text-muted font-medium mt-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-accent" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between">
              {/* Active User Actions */}
              {isActive && (
                <>
                  <button
                    onClick={() => onView(user)}
                    className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onEdit(user)}
                      className="px-4 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-dark hover:bg-surface-subtle transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onSuspend(user)}
                      className="px-4 py-1.5 rounded-xl border border-primary/30 text-xs font-bold text-primary hover:bg-primary-light transition-colors"
                    >
                      Suspend
                    </button>
                  </div>
                </>
              )}

              {/* Pending User Actions */}
              {isPending && (
                <div className="flex items-center justify-end gap-2.5 w-full">
                  <button
                    onClick={() => onReject(user)}
                    className="px-4 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-dark hover:bg-surface-subtle transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(user)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve</span>
                  </button>
                </div>
              )}

              {/* Suspended User Actions */}
              {isSuspended && (
                <div className="flex items-center justify-end w-full">
                  <button
                    onClick={() => onReactivate(user)}
                    className="px-4 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-dark hover:bg-surface-subtle transition-colors"
                  >
                    Reactivate
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
