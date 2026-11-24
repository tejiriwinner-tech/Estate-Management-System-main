import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    data: { reminded_all: true },
    message: "Payment reminders dispatched to all residents with pending balances.",
  });
}
