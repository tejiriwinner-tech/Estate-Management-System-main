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

    const formatted = (invoices || []).map((inv: any) => ({
      id: String(inv.id),
      reference: inv.reference || `SINV-00${inv.id}`,
      description: inv.description || "Store License",
      amount: `₦${(Math.round(Number(inv.amount_kobo || 0) / 100)).toLocaleString()}`,
      status: inv.status || "Paid",
      date: inv.issued_on || (inv.created_at ? new Date(inv.created_at).toISOString().split("T")[0] : "—"),
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch invoices.", error: err.message }, { status: 500 });
  }
}
