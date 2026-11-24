import { NextRequest, NextResponse } from "next/server";
import type { PaystackBillItem } from "@/types/paystackForm";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id?: string; billId?: string }> }) {
  const resolved = await params;
  const billId = resolved.billId || resolved.id || "SC-2026-1041";

  const data: PaystackBillItem = {
    id: billId,
    serviceName: "Monthly Estate Security & Maintenance Levy",
    category: "Security & Infrastructure",
    amount: 35000,
    residentEmail: "resident@lincolnestate.ng",
    residentUnit: "Villa A-402",
  };

  return NextResponse.json({ data });
}
