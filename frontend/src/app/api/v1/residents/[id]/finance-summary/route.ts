import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { ResidentFinanceSummaryData } from "@/types/residentFinance";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id.replace(/\D/g, "")) || 0;

  let user: any = null;
  try {
    if (numericId > 0) {
      const u = await sql`SELECT id, name, email, unit_number, phone, status FROM users WHERE id = ${numericId} LIMIT 1`;
      if (u.length > 0) user = u[0];
    }
    if (!user) {
      const u2 = await sql`SELECT id, name, email, unit_number, phone, status FROM users WHERE LOWER(role) = 'resident' ORDER BY id ASC LIMIT 1`;
      if (u2.length > 0) user = u2[0];
    }
  } catch {
    // ignore
  }

  const name = user?.name || "Estate Resident";
  const unit = user?.unit_number || "Assigned Unit";
  const phone = user?.phone || "—";

  let charges: any[] = [];
  try {
    charges = await sql`
      SELECT * FROM service_charges
      WHERE (${user?.id ? sql`user_id = ${Number(user.id)}` : sql`1=0`})
         OR LOWER(COALESCE(resident_name, '')) = LOWER(${name})
         OR (${unit !== "Assigned Unit" ? sql`LOWER(COALESCE(unit_number, '')) = LOWER(${unit})` : sql`1=0`})
      ORDER BY id DESC
    `;
  } catch {
    charges = [];
  }

  const paidRows = charges.filter((c) => String(c.status || "").toLowerCase() === "paid");
  const unpaidRows = charges.filter((c) => String(c.status || "").toLowerCase() !== "paid");

  const totalPaid = paidRows.reduce((s, c) => s + Number(c.amount || 0), 0);
  const outstandingBalance = unpaidRows.reduce((s, c) => s + Number(c.amount || 0), 0);
  const lastPaid = paidRows[0];
  const lastPaymentDate = lastPaid?.paid_at || lastPaid?.updated_at
    ? new Date(lastPaid.paid_at || lastPaid.updated_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
    : "No payments yet";

  const paymentTimeline = paidRows.map((c) => ({
    id: `pay-${c.id}`,
    serviceName: c.service_type || "Estate Service Charge",
    invoiceNumber: c.invoice_no || `SC-${c.id}`,
    iconType: "security" as const,
    amount: Number(c.amount || 0),
    date: new Date(c.paid_at || c.updated_at || c.created_at || Date.now()).toLocaleDateString("en-NG"),
    status: "PAID" as const,
  }));

  const outstandingBills = unpaidRows.map((c) => {
    const daysOverdue = c.due_date ? Math.max(0, Math.floor((Date.now() - new Date(c.due_date).getTime()) / 86400000)) : 0;
    return {
      id: `bill-${c.id}`,
      title: c.service_type || "Estate Service Charge",
      dueDate: c.due_date ? new Date(c.due_date).toLocaleDateString("en-NG") : "Due",
      amount: Number(c.amount || 0),
      daysOverdue,
      status: (daysOverdue > 0 ? "OVERDUE" : "DUE_SOON") as "OVERDUE" | "DUE_SOON",
    };
  });

  const data: ResidentFinanceSummaryData = {
    profile: {
      id: String(user?.id || id),
      name,
      unit,
      street: "Post Army Housing Estate",
      phone,
      status: String(user?.status || "active").toUpperCase() === "SUSPENDED" ? "INACTIVE" : "ACTIVE",
    },
    kpis: {
      totalPaid,
      outstandingBalance,
      lastPaymentDate,
      activeServicesCount: charges.length,
    },
    paymentTimeline,
    outstandingBills,
    nextBillingNotice:
      outstandingBalance > 0
        ? `₦${outstandingBalance.toLocaleString()} outstanding across ${unpaidRows.length} pending charge(s).`
        : "All billed estate service charges are currently cleared.",
    preferences: {
      preferredMethod: "Bank Transfer / Paystack",
      billingFrequency: "Monthly",
      autoPayStatus: "Disabled",
      documentName: `${unit.replace(/\s+/g, "_")}_Ledger.pdf`,
      documentUrl: "#",
    },
  };

  return NextResponse.json({ data });
}
