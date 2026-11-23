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

    if (products.length === 0) {
      products = [
        { id: 1, sku: "PRD-001", name: "Fresh Farm Organic Eggs (Crate)", category: "Groceries", price: 3800, stock: 45, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80" },
        { id: 2, sku: "PRD-002", name: "Premium Basmati Rice (5kg)", category: "Pantry", price: 12500, stock: 30, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
        { id: 3, sku: "PRD-003", name: "Disinfectant Surface Cleaner (1L)", category: "Household", price: 2400, stock: 60, image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80" },
      ];
    } else {
      products = products.map((p: any) => ({
        id: p.id,
        sku: p.sku || `PRD-00${p.id}`,
        name: p.name,
        category: p.category || "General",
        price: Math.round(Number(p.price_kobo || 0) / 100),
        stock: Number(p.stock || 10),
        description: p.description,
        image: p.image || "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
        featured: Boolean(p.featured),
      }));
    }

    return NextResponse.json({ data: products });
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
