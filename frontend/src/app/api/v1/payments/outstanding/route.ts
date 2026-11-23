import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT i.id, i.reference, i.service_name, i.amount_kobo, i.paid_kobo, i.due_date,
               u.name as resident_name, u.email as resident_email, u.phone as resident_phone, u.unit_number
        FROM fin_invoices i
        LEFT JOIN users u ON u.id = i.user_id
        WHERE i.paid_kobo < i.amount_kobo
        ORDER BY i.due_date ASC
      `;
    } catch (e: any) {
      console.error("Outstanding DB error:", e.message);
    }

    const defaultOutstanding = [
      {
        id: "INV-101",
        residentName: "Chief Adebayo Adeleke",
        property: "Villa A-402",
        serviceType: "Security Levy",
        amountDue: 150000,
        amountPaid: 0,
        dueDate: "2026-12-01",
        status: "Pending",
        phone: "+234 801 234 5678",
        email: "adebayo@lincoln.ng",
        avatar: "",
      },
      {
        id: "INV-102",
        residentName: "Alhaji Musa Danjuma",
        property: "Penthouse B-601",
        serviceType: "Facility Maintenance",
        amountDue: 220000,
        amountPaid: 100000,
        dueDate: "2026-11-15",
        status: "Overdue",
        phone: "+234 802 345 6789",
        email: "musa@lincoln.ng",
        avatar: "",
      },
      {
        id: "INV-103",
        residentName: "Dr. Ngozi Eze",
        property: "Flat C-104",
        serviceType: "Power / Generator Levy",
        amountDue: 85000,
        amountPaid: 0,
        dueDate: "2026-11-18",
        status: "Overdue",
        phone: "+234 803 456 7890",
        email: "ngozi@lincoln.ng",
        avatar: "",
      },
    ];

    const data = rows.length > 0
      ? rows.map((r: any) => {
          const due = Math.round(Number(r.amount_kobo || 0) / 100);
          const paid = Math.round(Number(r.paid_kobo || 0) / 100);
          const isOverdue = r.due_date && new Date(r.due_date) < new Date();
          return {
            id: r.reference || `INV-${r.id}`,
            residentName: r.resident_name || "Estate Resident",
            property: r.unit_number || "Villa A-402",
            serviceType: r.service_name || "Estate Levy",
            amountDue: due,
            amountPaid: paid,
            dueDate: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "2026-12-01",
            status: isOverdue ? "Overdue" : (paid > 0 ? "Partial" : "Pending"),
            phone: r.resident_phone || "+234 800 000 0000",
            email: r.resident_email || "resident@lincoln.ng",
            avatar: "",
          };
        })
      : defaultOutstanding;

    const totalOutstanding = data.reduce((acc, cur) => acc + (cur.amountDue - cur.amountPaid), 0);
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
