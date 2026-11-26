import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data: any[] = [];

    try {
      const scRows = await sql`
        SELECT sc.id, sc.invoice_no, sc.resident_name, sc.unit_number, sc.service_type,
               sc.amount, sc.due_date, sc.status, u.phone, u.email, u.avatar_url
        FROM service_charges sc
        LEFT JOIN users u ON u.id = sc.user_id
        WHERE sc.status != 'Paid'
        ORDER BY sc.due_date ASC NULLS LAST, sc.id DESC
      `;

      for (const r of scRows) {
        const dueDate = r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "";
        const isOverdue = Boolean(r.due_date && new Date(r.due_date) < new Date());
        data.push({
          id: r.invoice_no || `SC-${r.id}`,
          residentName: r.resident_name || "Estate Resident",
          property: r.unit_number || "—",
          serviceType: r.service_type || "Service Charge",
          amountDue: Number(r.amount || 0),
          amountPaid: 0,
          dueDate: dueDate || "—",
          status: isOverdue ? "Overdue" : "Pending",
          phone: r.phone || "—",
          email: r.email || "—",
          avatar: r.avatar_url || "",
        });
      }

      const invRows = await sql`
        SELECT i.id, i.reference, i.service_name, i.amount_kobo, i.paid_kobo, i.due_date,
               u.name as resident_name, u.email as resident_email, u.phone as resident_phone, u.unit_number, u.avatar_url
        FROM fin_invoices i
        LEFT JOIN users u ON u.id = i.user_id
        WHERE i.paid_kobo < i.amount_kobo
        ORDER BY i.due_date ASC
      `;

      for (const r of invRows) {
        const due = Math.round(Number(r.amount_kobo || 0) / 100);
        const paid = Math.round(Number(r.paid_kobo || 0) / 100);
        const isOverdue = Boolean(r.due_date && new Date(r.due_date) < new Date());
        data.push({
          id: r.reference || `INV-${r.id}`,
          residentName: r.resident_name || "Estate Resident",
          property: r.unit_number || "—",
          serviceType: r.service_name || "Estate Levy",
          amountDue: due,
          amountPaid: paid,
          dueDate: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "—",
          status: isOverdue ? "Overdue" : paid > 0 ? "Partial" : "Pending",
          phone: r.resident_phone || "—",
          email: r.resident_email || "—",
          avatar: r.avatar_url || "",
        });
      }
    } catch (e: any) {
      console.error("Outstanding DB error:", e.message);
    }

    const totalOutstanding = data.reduce((acc, cur) => acc + Math.max(0, cur.amountDue - cur.amountPaid), 0);
    const overdueCount = data.filter((d) => d.status === "Overdue").length;
    const pendingCount = data.filter((d) => d.status === "Pending").length;
    const partialCount = data.filter((d) => d.status === "Partial").length;

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
    return NextResponse.json({ message: "Could not fetch outstanding payments.", error: err.message }, { status: 500 });
  }
}
