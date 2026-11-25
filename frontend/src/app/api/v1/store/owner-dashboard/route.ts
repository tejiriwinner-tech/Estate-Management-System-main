import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let storeName = "Post Army House Mart";
    let productsCount = 5;
    let transactions: any[] = [];

    try {
      const stores = await sql`SELECT id, name FROM stores LIMIT 1`;
      if (stores.length > 0) storeName = stores[0].name;

      const pCount = await sql`SELECT count(*)::int as count FROM store_products`;
      if (pCount.length > 0) productsCount = pCount[0].count;

      const txs = await sql`
        SELECT id, reference, amount_kobo, status, channel, created_at
        FROM transactions
        ORDER BY id DESC
        LIMIT 10
      `;
      transactions = txs;
    } catch (e: any) {
      console.error("Store dashboard error:", e.message);
    }

    return NextResponse.json({
      data: {
        merchant: {
          name: storeName,
          merchantId: "LM-001",
          joinedAt: "2024-01-15",
          tier: "Official Estate Mart",
          totalRevenue: "4850000.00",
          pendingSettlements: "320000.00",
          activeProducts: productsCount || 5,
          orderVolume: 124,
          settlementMode: "Direct Bank Transfer",
          settlementFrequency: "Weekly",
          autoPayEnabled: true,
          documentName: "Merchant Verification Agreement",
        },
        transactions: transactions.length > 0
          ? transactions.map((t) => ({
              id: t.id,
              service: "Store Purchase",
              invoice: `INV-${t.reference || t.id}`,
              amount: (Number(t.amount_kobo || 0) / 100).toFixed(2),
              date: new Date(t.created_at || Date.now()).toISOString().split("T")[0],
              status: t.status === "success" ? "Completed" : "Processing",
              method: t.channel || "Paystack",
            }))
          : [
              { id: 1, service: "Grocery Pack A", invoice: "INV-8820", amount: "15500.00", date: "2026-11-20", status: "Completed", method: "Paystack" },
              { id: 2, service: "Household Supplies", invoice: "INV-8821", amount: "8200.00", date: "2026-11-21", status: "Completed", method: "Paystack" },
              { id: 3, service: "Beverage Crate", invoice: "INV-8822", amount: "22000.00", date: "2026-11-22", status: "Completed", method: "Bank Transfer" },
            ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch store owner dashboard.", error: err.message }, { status: 500 });
  }
}
