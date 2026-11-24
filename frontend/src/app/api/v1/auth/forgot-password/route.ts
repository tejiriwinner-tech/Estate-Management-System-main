import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    data: { ok: true, email: body.email || "" },
    message: "If an account matches this email, password reset instructions have been dispatched.",
  });
}
