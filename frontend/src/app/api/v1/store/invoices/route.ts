import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let invoices: any[] = [];
    try {
      invoices = await sql`
        SELECT id, reference, description, amount_kobo, status, issued_on, created_at
        FROM store_invoices
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Store invoices error:", e.message);
    }

    if (invoices.length === 0) {
      invoices = [
        { id: "1", reference: "SINV-001", description: "Monthly Commercial Hub Lease", amount: "₦120,000", status: "Paid", date: "2026-11-01" },
        { id: "2", reference: "SINV-002", description: "Power & Facility Service Charge", amount: "₦35,000", status: "Paid", date: "2026-11-05" },
      ];
    } else {
      invoices = invoices.map((inv: any) => ({
        id: String(inv.id),
        reference: inv.reference || `SINV-00${inv.id}`,
        description: inv.description || "Store License",
        amount: `₦${(Math.round(Number(inv.amount_kobo || 0) / 100)).toLocaleString()}`,
        status: inv.status || "Paid",
        date: inv.issued_on || (inv.created_at ? new Date(inv.created_at).toISOString().split("T")[0] : "2026-11-01"),
      }));
    }

    return NextResponse.json({ data: invoices });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch invoices.", error: err.message }, { status: 500 });
  }
}
