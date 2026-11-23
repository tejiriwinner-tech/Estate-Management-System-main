"use client";

import { ShieldAlert } from "lucide-react";
import IntelReportTable, { type ReportRow } from "@/components/security/intelligence/IntelReportTable";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

export default function UnderThreatReportsPage() {
  const { data, error } = useSecurityData<{ rows: ReportRow[]; total: number }>(
    "/security/reports?category=life_threat",
    { rows: [], total: 0 }
  );

  return (
    <div className="flex flex-col gap-5">
      <SecurityError message={error} />
      {/* Stat header */}
      <div className="bg-white rounded-xl border border-[--color-border] p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-[--color-danger-light] flex items-center justify-center shrink-0">
          <ShieldAlert className="w-7 h-7 text-[--color-danger]" />
        </div>
        <div>
          <p className="text-3xl font-bold text-[--color-text]">{data.total}</p>
          <p className="text-sm text-[--color-text-muted] mt-0.5">Under Threat Reports</p>
        </div>
      </div>

      {/* Table — reuses the same component pattern */}
      <IntelReportTable
        title="List Of All Life Under Threat Reports"
        rows={data.rows}
        total={data.total}
        showViewButton={false}
      />
    </div>
  );
}
