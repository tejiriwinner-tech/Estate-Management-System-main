"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Printer, Ban, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/admin/utils";

interface ProfileHeaderProps {
  name: string;
  isSuspended: boolean;
  onPrint: () => void;
  onToggleSuspend: () => void;
  onEdit: () => void;
}

export function ProfileHeader({
  name,
  isSuspended,
  onPrint,
  onToggleSuspend,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-medium min-w-0" aria-label="Breadcrumb">
        <Link href="/admin/staffs" className="text-muted hover:text-dark transition-colors shrink-0">
          Staffs
        </Link>
        <ChevronRight className="w-4 h-4 text-muted/60 shrink-0" />
        <span className="font-bold text-dark truncate">{name}</span>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 no-print">
        <button
          onClick={onPrint}
          className="flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-surface-subtle border border-border text-dark text-sm font-semibold hover:bg-border/60 transition-colors"
          title="Print profile"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </button>

        <button
          onClick={onToggleSuspend}
          className={cn(
            "flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl text-sm font-semibold border transition-colors",
            isSuspended
              ? "bg-accent-light border-accent/30 text-accent-hover hover:bg-accent/20"
              : "bg-primary-light border-primary/20 text-primary hover:bg-primary/15"
          )}
          title={isSuspended ? "Reactivate staff" : "Suspend staff"}
        >
          {isSuspended ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          <span className="hidden sm:inline">{isSuspended ? "Reactivate" : "Suspend"}</span>
        </button>

        <button
          onClick={onEdit}
          className="flex flex-1 sm:flex-initial items-center justify-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-sm transition-colors"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}
