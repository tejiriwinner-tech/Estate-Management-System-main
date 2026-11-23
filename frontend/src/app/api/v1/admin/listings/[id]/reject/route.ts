import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Listing documentation incomplete or inaccurate.";

    const res = await sql`
      UPDATE listings
      SET approval_status = 'rejected',
          rejection_reason = ${reason},
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: res[0],
      message: "Listing rejected.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not reject listing.", error: err.message }, { status: 500 });
  }
}
