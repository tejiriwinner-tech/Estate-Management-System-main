"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  Phone,
  Briefcase,
  Building2,
} from "lucide-react";
import { StaffMember, StaffStatus } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface StaffManagementTableProps {
  members: StaffMember[];
  totalMembersCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onView: (member: StaffMember) => void;
  onEdit: (member: StaffMember) => void;
  onToggleStatus: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

function StatusBadge({ status }: { status: StaffStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent-light text-accent">
        Active
      </span>
    );
  }
  if (status === "on_leave") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E9EDF5] text-[#4A5568]">
        On Leave
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary">
      Suspended
    </span>
  );
}

function formatStaffIdParts(staffId: string): { prefix: string; num: string } {
  const cleaned = staffId.replace(/^#/, "").replace(/\s+/g, "");
  const dashIdx = cleaned.indexOf("-");
  if (dashIdx !== -1) {
    return {
      prefix: cleaned.slice(0, dashIdx + 1),
      num: cleaned.slice(dashIdx + 1),
    };
  }
  return { prefix: cleaned, num: "" };
}

export function StaffManagementTable({
  members,
  totalMembersCount,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: StaffManagementTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const allOnPageSelected =
    members.length > 0 && members.every((m) => selectedIds.includes(m.id));

  const startIndex = members.length === 0 ? 0 : (currentPage - 1) * 6 + 1;
  const endIndex = members.length === 0 ? 0 : startIndex + members.length - 1;

  return (
    <div className="bg-surface-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
      {/* ================= DESKTOP TABLE (md and up) ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F6F9] border-b border-border/80 text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="py-3.5 pl-6 pr-3 w-12">
                <input
                  type="checkbox"
                  aria-label="Select all staff on this page"
                  checked={allOnPageSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-[#B22222] cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3 w-20">PROFILE</th>
              <th className="py-3.5 px-3 w-24">STAFF ID</th>
              <th className="py-3.5 px-4">NAME</th>
              <th className="py-3.5 px-4">DEPARTMENT</th>
              <th className="py-3.5 px-4">ROLE</th>
              <th className="py-3.5 px-4">PHONE</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 pl-3 pr-6 w-14 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/70 text-sm">
            {members.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted font-medium">
                  No staff members match the selected filters.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                const idParts = formatStaffIdParts(member.staff_id);
                const isMenuOpen = openMenuId === member.id;

                return (
                  <tr
                    key={member.id}
                    className={cn(
                      "hover:bg-surface-subtle/70 transition-colors",
                      isSelected && "bg-primary-light/20"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="py-4 pl-6 pr-3 align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Select ${member.name}`}
                        checked={isSelected}
                        onChange={() => onToggleSelect(member.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-[#B22222] cursor-pointer"
                      />
                    </td>

                    {/* Profile Avatar */}
                    <td className="py-4 px-3 align-middle">
                      <Link
                        href={`/admin/staffs/${member.id}`}
                        className="block relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-2xs hover:ring-2 hover:ring-primary/40 transition-all"
                      >
                        {member.avatar_url && !member.avatar_url.includes("ui-avatars") ? (
                          <Image
                            src={member.avatar_url}
                            alt={member.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full bg-dark text-white flex items-center justify-center text-xs font-extrabold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </Link>
                    </td>

                    {/* Staff ID (two-line stack like Figma Staff 5) */}
                    <td className="py-4 px-3 align-middle font-medium text-dark leading-tight">
                      <div>{idParts.prefix}</div>
                      {idParts.num && <div>{idParts.num}</div>}
                    </td>

                    {/* Name (stack first/last or bold link) */}
                    <td className="py-4 px-4 align-middle">
                      <Link
                        href={`/admin/staffs/${member.id}`}
                        className="font-extrabold text-dark hover:text-primary transition-colors leading-snug inline-block"
                      >
                        {member.name}
                      </Link>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 align-middle text-muted font-medium leading-snug max-w-[150px]">
                      {member.department || "Operations"}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 align-middle text-muted font-medium leading-snug max-w-[150px]">
                      {member.job_title}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 align-middle text-muted font-medium leading-snug whitespace-nowrap">
                      {member.phone ? (
                        <>
                          <div>{member.phone.split(" ").slice(0, 2).join(" ")}</div>
                          <div className="text-xs text-muted/90">
                            {member.phone.split(" ").slice(2).join(" ")}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 align-middle">
                      <StatusBadge status={member.status} />
                    </td>

                    {/* Three-dot Action Menu */}
                    <td className="py-4 pl-3 pr-6 align-middle text-right relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(isMenuOpen ? null : member.id)}
                        className="p-2 rounded-xl text-dark/70 hover:text-dark hover:bg-surface-subtle transition-colors"
                        aria-label={`Actions for ${member.name}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-6 top-12 z-20 w-44 bg-surface-card rounded-xl border border-border shadow-lg py-1.5 text-left animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onView(member);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-bold text-dark hover:bg-surface-subtle flex items-center gap-2.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-accent" />
                              <span>View Profile</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onEdit(member);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-bold text-dark hover:bg-surface-subtle flex items-center gap-2.5"
                            >
                              <Pencil className="w-3.5 h-3.5 text-dark/70" />
                              <span>Edit Staff</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onToggleStatus(member);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-bold text-dark hover:bg-surface-subtle flex items-center gap-2.5"
                            >
                              {member.status === "suspended" ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                                  <span>Reactivate</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3.5 h-3.5 text-primary" />
                                  <span>Suspend</span>
                                </>
                              )}
                            </button>
                            <div className="my-1 border-t border-border/60" />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDelete(member);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary-light/50 flex items-center gap-2.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Staff</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE & SMALL TABLET CARDS (< md) ================= */}
      <div className="md:hidden divide-y divide-border/70">
        {/* Select All bar on mobile */}
        <div className="px-4 py-3 bg-[#F4F6F9] flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded border-border accent-[#B22222]"
            />
            <span>Select All on Page</span>
          </label>
          <span>{members.length} Staff</span>
        </div>

        {members.length === 0 ? (
          <div className="py-10 px-4 text-center text-sm text-muted font-medium">
            No staff members match the selected filters.
          </div>
        ) : (
          members.map((member) => {
            const isSelected = selectedIds.includes(member.id);
            return (
              <div
                key={member.id}
                className={cn(
                  "p-4 space-y-3.5 transition-colors",
                  isSelected && "bg-primary-light/15"
                )}
              >
                {/* Top row: Checkbox + Avatar + Name/ID + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      aria-label={`Select ${member.name}`}
                      checked={isSelected}
                      onChange={() => onToggleSelect(member.id)}
                      className="w-4 h-4 rounded border-border accent-[#B22222] shrink-0"
                    />
                    <Link
                      href={`/admin/staffs/${member.id}`}
                      className="relative w-11 h-11 rounded-full overflow-hidden border border-border shrink-0"
                    >
                      {member.avatar_url && !member.avatar_url.includes("ui-avatars") ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <div className="w-full h-full bg-dark text-white flex items-center justify-center text-xs font-extrabold">
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
                        className="block font-extrabold text-dark text-sm hover:text-primary truncate"
                      >
                        {member.name}
                      </Link>
                      <span className="text-xs font-semibold text-muted">
                        ID: {member.staff_id}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={member.status} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs bg-surface-subtle/60 rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-1.5 text-muted truncate">
                    <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{member.department || "Operations"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted truncate">
                    <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{member.job_title}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-dark font-medium">
                    <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>{member.phone || "—"}</span>
                  </div>
                </div>

                {/* Mobile Action Row */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onView(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F6F9] text-dark hover:bg-border/60 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-accent" />
                    <span>Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F6F9] text-dark hover:bg-border/60 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(member)}
                    className="inline-flex items-center p-1.5 rounded-lg text-primary hover:bg-primary-light transition-colors"
                    aria-label={`Remove ${member.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= PAGINATION FOOTER ================= */}
      <div className="px-4 sm:px-6 py-4 bg-[#FAFBFD] border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-muted font-medium">
          Showing{" "}
          <span className="font-bold text-dark">
            {startIndex}–{endIndex}
          </span>{" "}
          of <span className="font-bold text-dark">{totalMembersCount}</span> members
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="w-8 h-8 rounded-lg border border-border bg-surface-card hover:bg-surface-subtle disabled:opacity-40 flex items-center justify-center text-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3].map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center",
                currentPage === pageNum
                  ? "bg-primary text-white shadow-xs"
                  : "border border-border bg-surface-card text-dark hover:bg-surface-subtle"
              )}
            >
              {pageNum}
            </button>
          ))}

          <span className="px-1.5 text-xs font-bold text-muted">...</span>

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center",
              currentPage === totalPages
                ? "bg-primary text-white shadow-xs"
                : "border border-border bg-surface-card text-dark hover:bg-surface-subtle"
            )}
          >
            {totalPages}
          </button>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="w-8 h-8 rounded-lg border border-border bg-surface-card hover:bg-surface-subtle disabled:opacity-40 flex items-center justify-center text-dark transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
