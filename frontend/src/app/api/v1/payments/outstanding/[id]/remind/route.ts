import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({
    data: { id, reminded: true },
    message: `Payment reminder dispatched for invoice #${id}.`,
  });
}
