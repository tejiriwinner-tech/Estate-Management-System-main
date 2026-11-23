import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = `PST_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      status: "send_otp",
      reference,
      message: "OTP sent to mobile phone linked to card",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not initiate charge.", error: err.message }, { status: 500 });
  }
}
