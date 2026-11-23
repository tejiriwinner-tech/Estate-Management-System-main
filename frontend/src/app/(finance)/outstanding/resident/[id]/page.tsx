"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ResidentFinanceSummaryView } from "@/components/resident-finance/ResidentFinanceSummaryView";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { ResidentFinanceSummaryData } from "@/types/residentFinance";

export default function DynamicResidentFinanceSummaryPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { data, error, loading } = useFinance<{ data: ResidentFinanceSummaryData }, ResidentFinanceSummaryData | null>(
    `/residents/${encodeURIComponent(id)}/finance-summary`,
    null
  );

  if (!data) {
    return (
      <div className="p-6">
        <ErrorBanner message={error} />
        {loading && !error && <p className="text-sm text-slate-500">Loading resident finance…</p>}
      </div>
    );
  }
  return <ResidentFinanceSummaryView data={data} />;
}
