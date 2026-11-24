import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body.plan || "Pro";
    await sql`UPDATE stores SET plan = ${plan}, updated_at = NOW() WHERE id = 1`.catch(() => {});
    return NextResponse.json({ data: { plan }, plan });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update subscription plan.", error: err.message }, { status: 500 });
  }
}
