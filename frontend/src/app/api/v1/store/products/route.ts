import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let products: any[] = [];
    try {
      products = activeOnly
        ? await sql`
            SELECT p.id, p.store_id, p.sku, p.name, p.category, p.price_kobo, p.stock, p.description, p.image, p.featured, p.created_at,
                   s.name as store_name, s.shop_unit, s.category as store_category, s.status as store_status
            FROM store_products p
            LEFT JOIN estate_stores s ON s.id = p.store_id
            WHERE s.status IS NULL OR s.status = 'active'
            ORDER BY p.id DESC
          `
        : await sql`
            SELECT p.id, p.store_id, p.sku, p.name, p.category, p.price_kobo, p.stock, p.description, p.image, p.featured, p.created_at,
                   s.name as store_name, s.shop_unit, s.category as store_category, s.status as store_status
            FROM store_products p
            LEFT JOIN estate_stores s ON s.id = p.store_id
            ORDER BY p.id DESC
          `;
    } catch (e: any) {
      console.error("Store products error:", e.message);
    }

    const formatted = products.map((p: any) => ({
      id: p.id,
      store_id: p.store_id ? Number(p.store_id) : 1,
      store_name: p.store_name || "Estate Store",
      shop_unit: p.shop_unit || "Commercial Plaza",
      sku: p.sku || `PRD-00${p.id}`,
      name: p.name,
      category: p.category || "General",
      price: Math.round(Number(p.price_kobo || 0) / 100),
      stock: Number(p.stock || 0),
      description: p.description,
      image: p.image || null,
      featured: Boolean(p.featured),
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch products.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, price, stock, description, image, store_id } = body;
    const priceKobo = Math.round(Number(price || 0) * 100);

    let resolvedStoreId = store_id ? Number(store_id) : 1;
    if (!store_id) {
      try {
        const s = await sql`SELECT id FROM estate_stores ORDER BY id DESC LIMIT 1`;
        if (s.length > 0) resolvedStoreId = Number(s[0].id);
      } catch {
        // default 1
      }
    }

    const res = await sql`
      INSERT INTO store_products (
        store_id, sku, name, category, price_kobo, stock, description, image, featured, created_at, updated_at
      )
      VALUES (
        ${resolvedStoreId}, ${`SKU-${Date.now().toString().slice(-4)}`}, ${name}, ${category || "General"},
        ${priceKobo}, ${Number(stock || 10)}, ${description || null}, ${image || null}, false, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Product added to catalog." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not add product.", error: err.message }, { status: 500 });
  }
}
