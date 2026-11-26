import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let store: any = null;
    let productsCount = 0;
    let ordersCount = 0;
    let totalRevenue = 0;
    let pendingSettlements = 0;
    let transactions: any[] = [];

    try {
      const stores = await sql`
        SELECT id, name, category, shop_unit, owner_name, owner_email, status, created_at
        FROM estate_stores
        ORDER BY id DESC
        LIMIT 1
      `;
      if (stores.length > 0) store = stores[0];

      const pCount = await sql`SELECT count(*)::int as count FROM store_products`;
      if (pCount.length > 0) productsCount = Number(pCount[0].count || 0);

      const orderRows = await sql`
        SELECT id, order_no, product_name, total_naira, status, created_at
        FROM store_orders
        ORDER BY id DESC
        LIMIT 20
      `;
      ordersCount = orderRows.length;
      for (const o of orderRows) {
        const amt = Number(o.total_naira || 0);
        if (o.status === "Delivered") totalRevenue += amt;
        else pendingSettlements += amt;
      }
      transactions = orderRows.map((o: any) => ({
        id: o.id,
        service: o.product_name || "Store Purchase",
        invoice: o.order_no || `ORD-${o.id}`,
        amount: Number(o.total_naira || 0).toFixed(2),
        date: o.created_at ? new Date(o.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        status: o.status === "Delivered" ? "Completed" : "Processing",
        method: "Estate Order",
      }));
    } catch (e: any) {
      console.error("Store dashboard error:", e.message);
    }

    return NextResponse.json({
      data: {
        merchant: {
          name: store?.name || "Unassigned Store",
          ownerName: store?.owner_name || "Store Admin",
          shopUnit: store?.shop_unit || "Commercial Plaza",
          category: store?.category || "General",
          merchantId: store ? `ST-${String(store.id).padStart(3, "0")}` : "—",
          joinedAt: store?.created_at ? new Date(store.created_at).toISOString().split("T")[0] : "—",
          tier: "Post Army Housing Estate Store",
          totalRevenue: totalRevenue.toFixed(2),
          pendingSettlements: pendingSettlements.toFixed(2),
          activeProducts: productsCount,
          orderVolume: ordersCount,
          settlementMode: "Direct Bank Transfer",
          settlementFrequency: "Weekly",
          autoPayEnabled: false,
          documentName: "Merchant Verification Agreement",
        },
        transactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch store owner dashboard.", error: err.message }, { status: 500 });
  }
}
