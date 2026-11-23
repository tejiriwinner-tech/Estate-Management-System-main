import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const res = await sql`
      UPDATE listings
      SET approval_status = 'approved',
          approved_at = NOW(),
          rejection_reason = NULL,
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: res[0],
      message: "Listing approved and published to public landing page.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not approve listing.", error: err.message }, { status: 500 });
  }
}
