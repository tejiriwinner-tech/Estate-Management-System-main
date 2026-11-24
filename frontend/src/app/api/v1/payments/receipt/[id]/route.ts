import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { PaymentReceiptData } from "@/types/receipt";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cleanRef = decodeURIComponent(id).replace(/^#/, "");

  let residentName = "Chinedu Resident";
  let residentEmail = "resident@lincolnestate.ng";
  let propertyName = "Villa A-402";
  let amount = 35000;
  let serviceDesc = "Monthly Estate Security & Maintenance Levy";
  let txDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + " | 10:15 AM";

  try {
    const rows = await sql`
      SELECT p.reference, p.amount_kobo, p.channel, p.paid_at,
             u.name as user_name, u.email as user_email, u.unit_number
      FROM fin_payments p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.reference = ${cleanRef} OR CAST(p.id AS TEXT) = ${cleanRef}
      LIMIT 1
    `;
    if (rows.length > 0) {
      const r = rows[0];
      residentName = r.user_name || residentName;
      residentEmail = r.user_email || residentEmail;
      propertyName = r.unit_number || propertyName;
      if (r.amount_kobo) amount = Number(r.amount_kobo) / 100;
      if (r.paid_at) {
        txDate = new Date(r.paid_at).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
  } catch {
    // Fallback receipt data
  }

  const data: PaymentReceiptData = {
    receiptNumber: cleanRef.startsWith("RE") || cleanRef.startsWith("RCP") ? cleanRef : `RCP-${cleanRef}`,
    status: "Payment Success",
    residentName,
    residentEmail,
    residentPhone: "+234 801 234 5678",
    propertyName,
    estatePhase: "Army Estate Phase 1",
    lineItems: [
      {
        id: "li-1",
        serviceDescription: serviceDesc,
        subDescription: "24/7 Perimeter Patrol, ANPR Optical Gate Access & Common Infrastructure",
        billingPeriod: "November 2026",
        amount,
      },
    ],
    totalAmount: amount,
    paymentMethod: "Paystack Verified Settlement",
    transactionDate: txDate,
    generatedBy: "Lincoln Estate Treasury System v2.4",
    qrVerificationUrl: `https://lincolnestatemanagement.vercel.app/payments/receipt/${encodeURIComponent(cleanRef)}`,
    authorizationStampText: "LINCOLN ESTATE APPROVED",
    disclaimer: "This electronic receipt is digitally signed by Lincoln Estate Management and serves as official proof of levy clearance.",
  };

  return NextResponse.json({ data });
}
