import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    try {
      let rows: any[] = [];
      if (email) {
        rows = await sql`
          SELECT id, name, category, shop_unit, owner_name, owner_email, status
          FROM estate_stores
          WHERE LOWER(owner_email) = ${email}
          LIMIT 1
        `;
      }
      if (rows.length === 0) {
        rows = await sql`
          SELECT id, name, category, shop_unit, owner_name, owner_email, status
          FROM estate_stores
          ORDER BY id DESC
          LIMIT 1
        `;
      }
      if (rows.length > 0) {
        const s = rows[0];
        const isOpen = (s.status || "active") === "active";
        return NextResponse.json({
          data: {
            id: Number(s.id),
            name: s.name,
            category: s.category || "General & Groceries",
            shop_unit: s.shop_unit || "Commercial Plaza",
            owner_name: s.owner_name,
            owner_email: s.owner_email,
            status: s.status || "active",
            isOpen,
            is_open: isOpen,
          },
        });
      }
    } catch (e: any) {
      console.warn("Store /me DB lookup:", e.message);
    }

    return NextResponse.json({ data: null });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not fetch store status", error: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const newStatus = Boolean(body.is_open ?? body.isOpen);
    const statusText = newStatus ? "active" : "archived";
    const storeId = body.id ? Number(body.id) : null;

    let updated: any = null;
    try {
      const rows = storeId
        ? await sql`
            UPDATE estate_stores
            SET status = ${statusText}, updated_at = NOW()
            WHERE id = ${storeId}
            RETURNING id, name, category, shop_unit, owner_name, owner_email, status
          `
        : await sql`
            UPDATE estate_stores
            SET status = ${statusText}, updated_at = NOW()
            WHERE id = (SELECT id FROM estate_stores ORDER BY id DESC LIMIT 1)
            RETURNING id, name, category, shop_unit, owner_name, owner_email, status
          `;
      if (rows.length > 0) updated = rows[0];
    } catch (e: any) {
      console.warn("Store /me PATCH error:", e.message);
    }

    return NextResponse.json({
      data: updated
        ? {
            ...updated,
            isOpen: updated.status === "active",
            is_open: updated.status === "active",
          }
        : { isOpen: newStatus, is_open: newStatus },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not update store status", error: err.message },
      { status: 500 }
    );
  }
}
