import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { EMERGENCY_CODES, type EmergencyCodeKey } from "@/lib/emergencyCodes";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = String(body.code || "CODE_AMBER").toUpperCase() as EmergencyCodeKey;
    const spec = EMERGENCY_CODES[rawCode] ?? EMERGENCY_CODES.CODE_AMBER;

    const senderName = String(body.sender_name || "Estate Member").trim();
    const senderRole = String(body.sender_role || "Resident").trim();
    const senderEmail = String(body.sender_email || "").trim();
    const location = String(body.location || "Post Army Housing Estate").trim();
    const note = String(body.note || "").trim();

    let userId: number | null = null;
    if (senderEmail) {
      try {
        const u = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${senderEmail}) LIMIT 1`;
        if (u[0]?.id) userId = Number(u[0].id);
      } catch {
        // ignore
      }
    }

    const formattedMessage = `[${spec.label}] ${spec.title} | Sender: ${senderName} (${senderRole}) | Details: ${
      note || spec.protocol
    }`;

    let panicRecord: any = null;
    try {
      const panic = await sql`
        INSERT INTO panic_alerts (
          user_id, location, note, status, created_at, updated_at
        )
        VALUES (
          ${userId}, ${location}, ${formattedMessage}, 'active', NOW(), NOW()
        )
        RETURNING *
      `;
      panicRecord = panic[0] ?? null;
    } catch {
      // ignore if panic_alerts schema differs
    }

    const alertRow = await sql`
      INSERT INTO estate_alerts (
        sender_id, category, message, location, status, created_at, updated_at
      )
      VALUES (
        ${userId}, 'life_threat', ${formattedMessage}, ${location}, 'open', NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        data: alertRow[0] ?? panicRecord,
        code: spec.key,
        message: `${spec.label} dispatched to Security Command for ${location}.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not transmit emergency alert.", error: err?.message },
      { status: 500 }
    );
  }
}
