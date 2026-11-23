"use client";

import React from "react";
import Image from "next/image";
import { Pencil, Trash2, Eye, Check } from "lucide-react";
import { User } from "@/types/admin/user";
import { cn } from "@/lib/admin/utils";

interface UserTableDesktopProps {
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  onApprove: (user: User) => void;
}

export function UserTableDesktop({
  users,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  onApprove,
}: UserTableDesktopProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "manager":
        return "Manager";
      case "agent":
        return "Agent";
      case "maintenance":
        return "Maintenance";
      case "security":
        return "Security";
      case "super_admin":
      case "admin":
        return "Admin";
      default:
        return "Resident";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-light text-accent">
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309]">
            Pending
          </span>
        );
      case "suspended":
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary">
            {status === "suspended" ? "Suspended" : "Inactive"}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-subtle/50 text-[11px] font-bold text-muted uppercase tracking-wider">
              <th className="py-4 px-6">USER</th>
              <th className="py-4 px-6">HOUSE/UNIT</th>
              <th className="py-4 px-6">ROLE</th>
              <th className="py-4 px-6">STATUS</th>
              <th className="py-4 px-6 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  No users found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-surface-subtle/40 transition-colors group"
                >
                  {/* User Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      {user.avatar_url && !user.avatar_url.includes("ui-avatars") ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-border">
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm",
                            user.status === "inactive" || user.status === "suspended"
                              ? "bg-dark"
                              : "bg-primary"
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
                      <div>
                        <div className="font-bold text-dark text-[14px]">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted font-medium mt-0.5">
                          {user.email || user.unit_number || "Gate 1"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* House / Unit Column */}
                  <td className="py-4 px-6 text-dark font-medium">
                    {user.unit_number || "-"}
                  </td>

                  {/* Role Column */}
                  <td className="py-4 px-6 text-dark font-medium">
                    {getRoleBadge(user.role)}
                  </td>

                  {/* Status Column */}
                  <td className="py-4 px-6">{getStatusBadge(user.status)}</td>

                  {/* Actions Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(user)}
                        title="Edit user"
                        className="w-8 h-8 rounded-lg bg-dark hover:bg-dark-soft text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button (Primary Crimson) */}
                      <button
                        onClick={() => onDelete(user)}
                        title="Delete user"
                        className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* View or Approve Button */}
                      {user.status === "inactive" || user.status === "pending" ? (
                        <button
                          onClick={() => onApprove(user)}
                          title="Activate / Approve user"
                          className="w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onView(user)}
                          title="View user details"
                          className="w-8 h-8 rounded-lg border border-border hover:bg-surface-subtle text-dark flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-white text-xs">
        <div className="text-muted font-medium">
          Showing <span className="font-bold text-dark">1–{users.length}</span> of{" "}
          <span className="font-bold text-dark">{totalCount.toLocaleString()}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-3.5 py-1.5 rounded-lg border border-border text-muted hover:text-dark hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Previous
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all",
                currentPage === page
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border text-dark hover:bg-surface-subtle"
              )}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-3.5 py-1.5 rounded-lg border border-border text-muted hover:text-dark hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
