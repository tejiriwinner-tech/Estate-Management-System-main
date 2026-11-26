import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let products: any[] = [];
    try {
      products = await sql`
        SELECT id, sku, name, category, price_kobo, stock, description, image, featured, created_at
        FROM store_products
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Store products error:", e.message);
    }

    const formatted = products.map((p: any) => ({
      id: p.id,
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
    const { name, category, price, stock, description, image } = body;
    const priceKobo = Math.round(Number(price || 0) * 100);

    const res = await sql`
      INSERT INTO store_products (
        store_id, sku, name, category, price_kobo, stock, description, image, featured, created_at, updated_at
      )
      VALUES (
        1, ${`SKU-${Date.now().toString().slice(-4)}`}, ${name}, ${category || "General"},
        ${priceKobo}, ${Number(stock || 10)}, ${description || null}, ${image || null}, false, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Product added to catalog." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not add product.", error: err.message }, { status: 500 });
  }
}
