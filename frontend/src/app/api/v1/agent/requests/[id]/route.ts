import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const status = body.status || "Contacted";

    await sql`
      UPDATE listing_inquiries
      SET status = ${status.toLowerCase()}, updated_at = NOW()
      WHERE id = ${Number(id)}
    `.catch(() => {});

    return NextResponse.json({
      data: { id, status },
      ok: true,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update client request.", error: err.message }, { status: 500 });
  }
}
