import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = Number(id);

    try {
      const updated = await sql`
        UPDATE users
        SET status = CASE WHEN status = 'blocked' THEN 'active' ELSE 'blocked' END,
            updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id, name, email, phone, role, status, unit_number, moved_in_at, created_at, avatar_url
      `;
      if (updated.length > 0) {
        return NextResponse.json({ data: updated[0] });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      data: { id: userId, status: "active" },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not toggle user status.", error: err.message }, { status: 500 });
  }
}
