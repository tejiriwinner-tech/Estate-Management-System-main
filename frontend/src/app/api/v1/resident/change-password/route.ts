import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.password && body.password_confirmation && body.password !== body.password_confirmation) {
    return NextResponse.json({ message: "Password confirmation does not match." }, { status: 422 });
  }
  return NextResponse.json({ data: { ok: true }, message: "Password updated successfully." });
}
