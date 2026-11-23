"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DesktopReceipt } from "@/components/receipt/DesktopReceipt";
import { MobileReceipt } from "@/components/receipt/MobileReceipt";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { PaymentReceiptData } from "@/types/receipt";

export default function DynamicPaymentReceiptPage() {
  const params = useParams();
  const id = decodeURIComponent((params?.id as string) || "").replace(/^#/, "");

  const { data, error, loading } = useFinance<{ data: PaymentReceiptData }, PaymentReceiptData | null>(
    `/payments/receipt/${encodeURIComponent(id)}`,
    null
  );

  if (!data) {
    return (
      <div className="p-6">
        <ErrorBanner message={error} />
        {loading && !error && <p className="text-sm text-slate-500">Loading receipt…</p>}
      </div>
    );
  }

  return (
    <>
      <div className="block md:hidden">
        <MobileReceipt receipt={data} />
      </div>
      <div className="hidden md:block">
        <DesktopReceipt receipt={data} />
      </div>
    </>
  );
}
