import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { ResidentFinanceSummaryData } from "@/types/residentFinance";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id.replace(/\D/g, "")) || 2;

  let name = "Chinedu Resident";
  let unit = "Villa A-402";
  let phone = "+234 801 234 5678";

  try {
    const u = await sql`
      SELECT id, name, unit_number, phone FROM users WHERE id = ${numericId} LIMIT 1
    `;
    if (u.length > 0) {
      name = u[0].name || name;
      unit = u[0].unit_number || unit;
      phone = u[0].phone || phone;
    }
  } catch {
    // Fallback
  }

  const data: ResidentFinanceSummaryData = {
    profile: {
      id: String(id),
      name,
      unit,
      street: "Army Estate Phase 1, Palm Crescent",
      phone,
      status: "ACTIVE",
    },
    kpis: {
      totalPaid: 485000,
      outstandingBalance: 35000,
      lastPaymentDate: "Oct 28, 2026",
      activeServicesCount: 4,
    },
    paymentTimeline: [
      {
        id: "pay-1",
        serviceName: "Monthly Estate Security & Maintenance Levy",
        invoiceNumber: "RCP-2026-8841",
        iconType: "security",
        amount: 35000,
        date: "Oct 28, 2026",
        status: "PAID",
      },
      {
        id: "pay-2",
        serviceName: "Waste & Environmental Sanitation",
        invoiceNumber: "RCP-2026-8790",
        iconType: "waste",
        amount: 15000,
        date: "Oct 15, 2026",
        status: "PAID",
      },
      {
        id: "pay-3",
        serviceName: "24/7 Streetlight & Solar Grid Assessment",
        invoiceNumber: "RCP-2026-8612",
        iconType: "utility",
        amount: 25000,
        date: "Sep 30, 2026",
        status: "PAID",
      },
    ],
    outstandingBills: [
      {
        id: "bill-1041",
        title: "November Security & Maintenance Service Charge",
        dueDate: "Nov 30, 2026",
        amount: 35000,
        daysOverdue: 0,
        status: "DUE_SOON",
      },
    ],
    nextBillingNotice: "Next consolidated service charge cycle generates on December 1, 2026.",
    preferences: {
      preferredMethod: "Paystack Card / Bank Transfer",
      billingFrequency: "Monthly",
      autoPayStatus: "Enabled",
      documentName: "Villa_A402_Residency_Clearance_2026.pdf",
      documentUrl: "#",
    },
  };

  return NextResponse.json({ data });
}
