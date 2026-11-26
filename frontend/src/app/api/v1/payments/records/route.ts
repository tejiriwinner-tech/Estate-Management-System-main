import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const records: any[] = [];
    let totalRevenue = 0;

    try {
      const scRows = await sql`
        SELECT id, resident_name, unit_number, service_type, amount, status, invoice_no,
               payment_reference, receipt_url, due_date, paid_at, created_at
        FROM service_charges
        ORDER BY id DESC
        LIMIT 100
      `;

      for (const r of scRows) {
        const amt = Number(r.amount || 0);
        const isPaid = r.status === "Paid";
        const isOverdue = !isPaid && r.due_date && new Date(r.due_date) < new Date();
        if (isPaid) totalRevenue += amt;

        records.push({
          id: `sc-${r.id}`,
          receiptNumber: r.payment_reference || r.invoice_no || `SC-${r.id}`,
          residentName: r.resident_name || "Estate Resident",
          property: r.unit_number || "—",
          servicePaid: r.service_type || "Service Charge",
          amountPaid: amt,
          amount: amt,
          date: (r.paid_at || r.created_at)
            ? new Date(r.paid_at || r.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          channel: r.receipt_url ? "Receipt Upload" : "Direct",
          method: r.receipt_url ? "Receipt Uploaded" : isPaid ? "Bank Transfer" : "Pending",
          paymentMethod: r.receipt_url ? "Receipt Uploaded" : isPaid ? "Bank Transfer" : "Pending",
          status: isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending",
        });
      }

      const payRows = await sql`
        SELECT p.id, p.amount_kobo, p.method, p.reference, p.status, p.paid_at, p.created_at,
               u.name as resident_name, u.unit_number,
               i.service_name
        FROM fin_payments p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN fin_invoices i ON i.id = p.invoice_id
        ORDER BY p.id DESC
        LIMIT 100
      `;

      for (const p of payRows) {
        const amt = Math.round(Number(p.amount_kobo || 0) / 100);
        const isPaid = p.status === "success" || p.status === "paid";
        if (isPaid) totalRevenue += amt;
        records.push({
          id: `fp-${p.id}`,
          receiptNumber: p.reference || `REC-${p.id}`,
          residentName: p.resident_name || "Estate Resident",
          property: p.unit_number || "—",
          servicePaid: p.service_name || "Estate Levy",
          amountPaid: amt,
          amount: amt,
          date: (p.paid_at || p.created_at)
            ? new Date(p.paid_at || p.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          channel: p.method || "Paystack",
          method: p.method || "Paystack",
          paymentMethod: p.method || "Paystack",
          status: isPaid ? "Paid" : p.status === "pending" ? "Pending" : "Overdue",
        });
      }
    } catch (e: any) {
      console.error("Payments records DB error:", e.message);
    }

    return NextResponse.json({
      summary: {
        totalRevenue,
        paidItems: records.filter((r) => r.status === "Paid").length,
        pendingItems: records.filter((r) => r.status === "Pending").length,
        overdueItems: records.filter((r) => r.status === "Overdue").length,
      },
      data: records,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch payment records.", error: err.message }, { status: 500 });
  }
}
