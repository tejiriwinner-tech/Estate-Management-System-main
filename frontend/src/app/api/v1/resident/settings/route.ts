import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ message: "Settings saved successfully.", data: body });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save settings.", error: err.message }, { status: 500 });
  }
}
