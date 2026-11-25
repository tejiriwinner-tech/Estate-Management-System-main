import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, phone, address, description, manager } = body;

    const res = await sql`
      INSERT INTO stores (
        owner_id, name, category, phone, address, description, plan, is_open, open_weekends, created_at, updated_at
      )
      VALUES (
        5, ${name || "Post Army House Mart Express"}, ${category || "Retail & Grocery"}, ${phone || "+234 805 678 9012"},
        ${address || "Lincoln Commercial Hub"}, ${description || "Estate retail and household store"},
        'Premium', true, true, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({
      data: res[0],
      message: "Store registered successfully.",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not register store.", error: err.message }, { status: 500 });
  }
}
