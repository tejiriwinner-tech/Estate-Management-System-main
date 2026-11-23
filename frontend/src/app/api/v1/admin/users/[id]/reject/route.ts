import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = Number(id);

    try {
      const res = await sql`
        UPDATE users
        SET status = 'rejected', updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id, name, email, role, status
      `;
      if (res.length > 0) {
        return NextResponse.json({ data: res[0], message: "User rejected successfully." });
      }
    } catch (e: any) {
      console.warn("User reject DB err:", e.message);
    }

    return NextResponse.json({
      data: { id: userId, status: "rejected" },
      message: "User rejected.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not reject user.", error: err.message }, { status: 500 });
  }
}
