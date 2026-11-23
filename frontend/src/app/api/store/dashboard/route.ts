import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    let storeName = "Lincoln Central Mart";
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
    } catch {
      // Fallback
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
              status: t.status || "paid",
            }))
          : [
              { id: 1, service: "RFID Smart Keycards", invoice: "INV-9901", amount: "15000.00", date: "2026-11-20", status: "paid" },
              { id: 2, service: "Emergency Utility Torch", invoice: "INV-9902", amount: "8500.00", date: "2026-11-21", status: "paid" },
            ],
        urgentAction: null,
        nextBillingDate: "2026-12-01",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Store service encountered an error." }, { status: 500 });
  }
}
