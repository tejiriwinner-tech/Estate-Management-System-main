"use client";

import React from "react";
import Image from "next/image";
import { Briefcase } from "lucide-react";

interface EmploymentCardProps {
  employeeId: string;
  joinDate: string;
  department: string;
  reportsTo?: { name: string; avatar_url: string };
  leaveUsed?: number;
  leaveTotal?: number;
}

export function EmploymentCard({
  employeeId,
  joinDate,
  department,
  reportsTo,
  leaveUsed,
  leaveTotal,
}: EmploymentCardProps) {
  const hasLeave = leaveTotal !== undefined && leaveUsed !== undefined;
  const pct = hasLeave ? Math.min(100, Math.round((leaveUsed! / (leaveTotal || 1)) * 100)) : 0;

  return (
    <div className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-card h-full flex flex-col">
      <h2 className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-dark tracking-tight">
        <Briefcase className="w-5 h-5 text-accent" />
        Employment
      </h2>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 mt-5">
        <div>
          <dt className="text-[10px] font-bold text-muted uppercase tracking-wider">Employee ID</dt>
          <dd className="text-sm sm:text-base font-semibold text-dark mt-1 break-all">{employeeId}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-muted uppercase tracking-wider">Join Date</dt>
          <dd className="text-sm sm:text-base font-semibold text-dark mt-1">{joinDate}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-muted uppercase tracking-wider">Department</dt>
          <dd className="text-sm sm:text-base font-semibold text-dark mt-1">{department}</dd>
        </div>
        {reportsTo && (
        <div>
          <dt className="text-[10px] font-bold text-muted uppercase tracking-wider">Reports To</dt>
          <dd className="flex items-center gap-2 mt-1 min-w-0">
            <span className="relative w-6 h-6 rounded-full overflow-hidden border border-border shrink-0">
              <Image src={reportsTo.avatar_url} alt={reportsTo.name} fill className="object-cover" sizes="24px" />
            </span>
            <span className="text-sm font-semibold text-dark truncate">{reportsTo.name}</span>
          </dd>
        </div>
        )}
      </dl>

      {/* Leave balance */}
      {hasLeave && (
      <div className="mt-auto pt-5">
        <div className="rounded-xl bg-surface-subtle border border-border p-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-dark">Annual Leave Balance</span>
            <span className="text-dark">
              {leaveUsed} / {leaveTotal} Days
            </span>
          </div>
          <div
            className="mt-2.5 h-2 rounded-full bg-border overflow-hidden"
            role="progressbar"
            aria-valuenow={leaveUsed}
            aria-valuemin={0}
            aria-valuemax={leaveTotal}
          >
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
