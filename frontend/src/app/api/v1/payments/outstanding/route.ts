import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data: any[] = [];

    try {
      const scRows = await sql`
        SELECT sc.*, u.phone as u_phone, u.email as u_email
        FROM service_charges sc
        LEFT JOIN users u ON u.id = sc.user_id
        WHERE LOWER(COALESCE(sc.status, 'pending')) != 'paid'
        ORDER BY sc.due_date ASC NULLS LAST, sc.id DESC
      `;

      for (const r of scRows) {
        const dueDate = r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "";
        const daysOverdue = r.due_date
          ? Math.max(0, Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000))
          : 0;
        const isOverdue = daysOverdue > 0;
        data.push({
          id: r.invoice_no || `SC-${r.id}`,
          residentId: r.user_id ? String(r.user_id) : String(r.id),
          invoiceNumber: r.invoice_no || `SC-${r.id}`,
          residentName: r.resident_name || "Estate Resident",
          propertyAddress: r.unit_number || "—",
          property: r.unit_number || "—",
          serviceType: r.service_type || "Service Charge",
          amountDue: Number(r.amount || 0),
          amountPaid: 0,
          dueDate: dueDate || "—",
          daysOverdue,
          status: isOverdue ? "overdue" : "pending",
          phone: r.u_phone || "—",
          email: r.u_email || "—",
        });
      }
    } catch (e: any) {
      console.error("Outstanding service_charges DB error:", e.message);
    }

    try {
      const invRows = await sql`
        SELECT i.id, i.user_id, i.reference, i.service_name, i.amount_kobo, i.paid_kobo, i.due_date,
               u.name as resident_name, u.email as resident_email, u.phone as resident_phone, u.unit_number
        FROM fin_invoices i
        LEFT JOIN users u ON u.id = i.user_id
        WHERE i.paid_kobo < i.amount_kobo
        ORDER BY i.due_date ASC
      `;

      for (const r of invRows) {
        const due = Math.round(Number(r.amount_kobo || 0) / 100);
        const paid = Math.round(Number(r.paid_kobo || 0) / 100);
        const daysOverdue = r.due_date
          ? Math.max(0, Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000))
          : 0;
        const isOverdue = daysOverdue > 0;
        data.push({
          id: r.reference || `INV-${r.id}`,
          residentId: r.user_id ? String(r.user_id) : String(r.id),
          invoiceNumber: r.reference || `INV-${r.id}`,
          residentName: r.resident_name || "Estate Resident",
          propertyAddress: r.unit_number || "—",
          property: r.unit_number || "—",
          serviceType: r.service_name || "Estate Levy",
          amountDue: due,
          amountPaid: paid,
          dueDate: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "—",
          daysOverdue,
          status: isOverdue ? "overdue" : paid > 0 ? "partial" : "pending",
          phone: r.resident_phone || "—",
          email: r.resident_email || "—",
        });
      }
    } catch {
      // fin_invoices table may not exist
    }

    const totalOutstanding = data.reduce((acc, cur) => acc + Math.max(0, cur.amountDue - cur.amountPaid), 0);
    const overdueCount = data.filter((d) => d.status === "overdue").length;
    const pendingCount = data.filter((d) => d.status === "pending").length;
    const partialCount = data.filter((d) => d.status === "partial").length;

    return NextResponse.json({
      data,
      summary: {
        totalOutstanding,
        overdueCount,
        pendingCount,
        partialCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch outstanding payments.", error: err?.message }, { status: 500 });
  }
}
