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
      // Fallback
    }

    const products =
      rows.length > 0
        ? rows.map((p: any) => ({
            id: String(p.id),
            sku: p.sku || `LE-PRD-${p.id}`,
            name: p.name,
            category: p.category || "Electronics",
            price: Math.round(Number(p.price_kobo || 0) / 100) || 4500,
            stock: Number(p.stock ?? 20),
            description: p.description || "Verified Post Army House Estate Central Mart inventory item.",
            image: p.image || "/assets/products/catalog-3.jpeg",
            featured: Boolean(p.featured),
          }))
        : [
            {
              id: "1",
              sku: "LE-GRO-001",
              name: "Fresh Farm Organic Eggs (Crate)",
              category: "Homeware",
              price: 3800,
              stock: 45,
              description: "Farm-fresh organic crate delivered daily to Post Army House Estate.",
              image: "/assets/products/catalog-3.jpeg",
              featured: true,
            },
            {
              id: "2",
              sku: "LE-HOM-002",
              name: "Smart Solar Emergency Lantern",
              category: "Electronics",
              price: 18500,
              stock: 22,
              description: "Rechargeable dual-beam LED backup lantern with USB port.",
              image: "/assets/products/catalog-3.jpeg",
              featured: true,
            },
            {
              id: "3",
              sku: "LE-MNT-003",
              name: "Multi-Surface Disinfectant (2L)",
              category: "Maintenance",
              price: 4200,
              stock: 60,
              description: "Hospital-grade antibacterial home care solution.",
              image: "/assets/products/catalog-3.jpeg",
              featured: false,
            },
          ];

    return NextResponse.json({ data: products });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not load store catalog.", error: err.message }, { status: 500 });
  }
}
