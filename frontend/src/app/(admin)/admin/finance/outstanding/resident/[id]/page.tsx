"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResidentFinanceSummaryView } from "@/components/resident-finance/ResidentFinanceSummaryView";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { ResidentFinanceSummaryData } from "@/types/residentFinance";

export default function AdminResidentFinanceDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { data, error, loading } = useFinance<{ data: ResidentFinanceSummaryData }, ResidentFinanceSummaryData | null>(
    `/residents/${encodeURIComponent(id)}/finance-summary`,
    null
  );

  return (
    <div className="space-y-4">
      <Link
        href="/admin/finance/outstanding/resident"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B22222]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Resident Finance Summary</span>
      </Link>

      {!data ? (
        <div className="p-6">
          <ErrorBanner message={error} />
          {loading && !error && <p className="text-sm text-slate-500">Loading resident finance…</p>}
        </div>
      ) : (
        <ResidentFinanceSummaryView data={data} />
      )}
    </div>
  );
}
