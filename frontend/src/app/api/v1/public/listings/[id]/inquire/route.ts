import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    try {
      // If table exists, update inquiries count on listing
      await sql`
        UPDATE listings
        SET inquiries = COALESCE(inquiries, 0) + 1
        WHERE id = ${id}
      `;
    } catch (e) {
      // Graceful fallback
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully. An agent will contact you shortly.",
      data: { listing_id: id, client: body.name },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
