import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureProductMerchColumns() {
  await sql`ALTER TABLE store_products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`.catch(() => {});
  await sql`ALTER TABLE store_products ADD COLUMN IF NOT EXISTS admin_visible BOOLEAN DEFAULT true`.catch(() => {});
  await sql`ALTER TABLE estate_stores ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false`.catch(() => {});
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let products: any[] = [];
    try {
      await ensureProductMerchColumns();
      products = activeOnly
        ? await sql`
            SELECT p.id, p.store_id, p.sku, p.name, p.category, p.price_kobo, p.stock, p.description, p.image,
                   COALESCE(p.featured, false) as featured,
                   COALESCE(p.admin_visible, true) as admin_visible,
                   p.created_at,
                   s.name as store_name, s.shop_unit, s.category as store_category, s.status as store_status,
                   COALESCE(s.is_promoted, false) as store_promoted
            FROM store_products p
            LEFT JOIN estate_stores s ON s.id = p.store_id
            WHERE (s.status IS NULL OR s.status = 'active')
              AND COALESCE(p.admin_visible, true) = true
            ORDER BY COALESCE(s.is_promoted, false) DESC, COALESCE(p.featured, false) DESC, p.id DESC
          `
        : await sql`
            SELECT p.id, p.store_id, p.sku, p.name, p.category, p.price_kobo, p.stock, p.description, p.image,
                   COALESCE(p.featured, false) as featured,
                   COALESCE(p.admin_visible, true) as admin_visible,
                   p.created_at,
                   s.name as store_name, s.shop_unit, s.category as store_category, s.status as store_status,
                   COALESCE(s.is_promoted, false) as store_promoted
            FROM store_products p
            LEFT JOIN estate_stores s ON s.id = p.store_id
            ORDER BY COALESCE(p.featured, false) DESC, p.id DESC
          `;
    } catch (e: any) {
      console.error("Store products error:", e.message);
    }

    const formatted = products.map((p: any) => ({
      id: p.id,
      store_id: p.store_id ? Number(p.store_id) : 1,
      store_name: p.store_name || "Estate Store",
      shop_unit: p.shop_unit || "Commercial Plaza",
      store_status: p.store_status || "active",
      store_promoted: Boolean(p.store_promoted),
      sku: p.sku || `PRD-00${p.id}`,
      name: p.name,
      category: p.category || "General",
      price: Math.round(Number(p.price_kobo || 0) / 100),
      stock: Number(p.stock || 0),
      description: p.description,
      image: p.image || null,
      featured: Boolean(p.featured),
      admin_visible: p.admin_visible === undefined ? true : Boolean(p.admin_visible),
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch products.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureProductMerchColumns();
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
        store_id, sku, name, category, price_kobo, stock, description, image, featured, admin_visible, created_at, updated_at
      )
      VALUES (
        ${resolvedStoreId}, ${`SKU-${Date.now().toString().slice(-4)}`}, ${name}, ${category || "General"},
        ${priceKobo}, ${Number(stock || 10)}, ${description || null}, ${image || null}, false, true, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Product added to catalog." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not add product.", error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureProductMerchColumns();
    const body = await req.json();
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json({ message: "Product id is required." }, { status: 400 });
    }

    const featured = typeof body.featured === "boolean" ? body.featured : null;
    const adminVisible = typeof body.admin_visible === "boolean" ? body.admin_visible : null;

    const updated = await sql`
      UPDATE store_products
      SET
        featured = COALESCE(${featured}, featured, false),
        admin_visible = COALESCE(${adminVisible}, admin_visible, true),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      data: updated[0],
      message: "Product merchandising updated.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update product.", error: err.message }, { status: 500 });
  }
}
