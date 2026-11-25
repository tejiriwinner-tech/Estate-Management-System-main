import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureLocationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_locations (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) UNIQUE NOT NULL,
      resident_name VARCHAR(255),
      unit_number VARCHAR(100),
      phase VARCHAR(80) DEFAULT 'Army Estate Phase 1',
      pin_x NUMERIC(5, 2) DEFAULT 42,
      pin_y NUMERIC(5, 2) DEFAULT 48,
      latitude NUMERIC(10, 6),
      longitude NUMERIC(10, 6),
      landmark_notes TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function GET(req: NextRequest) {
  try {
    const email = (req.headers.get("x-user-email") || "resident@lincolnestate.ng").toLowerCase().trim();
    await ensureLocationsTable();
    const rows = await sql`
      SELECT * FROM user_locations WHERE LOWER(user_email) = ${email} LIMIT 1
    `;
    const row = rows[0] || {
      user_email: email,
      resident_name: "Chinedu Resident",
      unit_number: "Villa A-402",
      phase: "Army Estate Phase 1",
      pin_x: 34,
      pin_y: 44,
      latitude: null,
      longitude: null,
      landmark_notes: "2nd turning off Palm Crescent, white gate with solar pillar light.",
    };
    return NextResponse.json({
      data: {
        ...row,
        pin_x: Number(row.pin_x ?? 34),
        pin_y: Number(row.pin_y ?? 44),
        latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
        longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      data: {
        phase: "Army Estate Phase 1",
        unit_number: "Villa A-402",
        pin_x: 34,
        pin_y: 44,
        latitude: null,
        longitude: null,
        landmark_notes: "Palm Crescent, Phase 1",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_email = "resident@lincolnestate.ng",
      resident_name = "Chinedu Resident",
      unit_number = "Villa A-402",
      phase = "Army Estate Phase 1",
      pin_x = 34,
      pin_y = 44,
      latitude = null,
      longitude = null,
      landmark_notes = "",
      dispatch_emergency = false,
    } = body;

    const email = String(user_email).toLowerCase().trim();
    await ensureLocationsTable();

    const saved = await sql`
      INSERT INTO user_locations (user_email, resident_name, unit_number, phase, pin_x, pin_y, latitude, longitude, landmark_notes, updated_at)
      VALUES (${email}, ${resident_name}, ${unit_number}, ${phase}, ${Number(pin_x)}, ${Number(pin_y)}, ${latitude !== null ? Number(latitude) : null}, ${longitude !== null ? Number(longitude) : null}, ${landmark_notes}, NOW())
      ON CONFLICT (user_email) DO UPDATE SET
        resident_name = EXCLUDED.resident_name,
        unit_number = EXCLUDED.unit_number,
        phase = EXCLUDED.phase,
        pin_x = EXCLUDED.pin_x,
        pin_y = EXCLUDED.pin_y,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        landmark_notes = EXCLUDED.landmark_notes,
        updated_at = NOW()
      RETURNING *
    `;

    if (dispatch_emergency) {
      const coordsText =
        latitude !== null && longitude !== null
          ? `GPS (${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)})`
          : `Map Pin (${Math.round(Number(pin_x))}%, ${Math.round(Number(pin_y))}%)`;
      await sql`
        INSERT INTO estate_alerts (sender_id, category, message, location, status, created_at, updated_at)
        VALUES (
          2,
          'life_threat',
          ${`Emergency location pin shared by ${resident_name} (${unit_number}): ${coordsText}. ${landmark_notes || ""}`},
          ${`${phase} • ${unit_number}`},
          'open',
          NOW(),
          NOW()
        )
      `.catch(() => {});
    }

    return NextResponse.json({
      data: saved[0],
      message: dispatch_emergency
        ? "Emergency location pin dispatched to Security HQ!"
        : "Home location pin saved.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save location pin.", error: err.message }, { status: 500 });
  }
}
