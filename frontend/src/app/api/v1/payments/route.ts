import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let payments: any[] = [];
    try {
      payments = await sql`
        SELECT p.id, p.amount_kobo, p.method, p.reference, p.status, p.paid_at,
               u.name as resident_name, u.email as resident_email,
               i.service_name, i.reference as invoice_reference
        FROM fin_payments p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN fin_invoices i ON p.invoice_id = i.id
        ORDER BY p.paid_at DESC
        LIMIT 50
      `;
    } catch (e) {
      // Graceful fallback
    }

    const formatted = (payments || []).map((p) => ({
      id: String(p.id),
      receiptNumber: p.reference || `REC-${p.id}`,
      residentName: p.resident_name || "Estate Resident",
      serviceName: p.service_name || "General Levy",
      amount: `₦${((Number(p.amount_kobo) || 0) / 100).toLocaleString()}`,
      paymentMethod: p.method || "Transfer",
      status: p.status || "success",
      date: p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "Today",
    }));

    const totalCollectedKobo = (payments || [])
      .filter((p) => p.status === "success" || p.status === "paid")
      .reduce((acc, p) => acc + (Number(p.amount_kobo) || 0), 0);
    const pendingKobo = (payments || [])
      .filter((p) => p.status === "pending")
      .reduce((acc, p) => acc + (Number(p.amount_kobo) || 0), 0);

    return NextResponse.json({
      summary: {
        totalCollected: `₦${Math.round(totalCollectedKobo / 100).toLocaleString()}`,
        totalTransactions: formatted.length,
        pendingVerification: `₦${Math.round(pendingKobo / 100).toLocaleString()}`,
      },
      data: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
