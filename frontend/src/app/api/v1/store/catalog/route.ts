import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, sku, name, category, price_kobo, stock, description, image, featured
        FROM store_products
        ORDER BY id DESC
      `;
    } catch {
      rows = [];
    }

    const products = rows.map((p: any) => ({
      id: String(p.id),
      sku: p.sku || `PAHE-PRD-${p.id}`,
      name: p.name,
      category: p.category || "General",
      price: Math.round(Number(p.price_kobo || 0) / 100),
      stock: Number(p.stock ?? 0),
      description: p.description || "",
      image: p.image || null,
      featured: Boolean(p.featured),
    }));

    return NextResponse.json({ data: products });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch store catalog.", error: err.message }, { status: 500 });
  }
}
