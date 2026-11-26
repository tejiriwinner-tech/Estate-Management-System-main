import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS live_gps_locations (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(200) UNIQUE NOT NULL,
      user_name VARCHAR(150) NOT NULL,
      user_role VARCHAR(60) NOT NULL,
      label VARCHAR(180) NOT NULL DEFAULT '',
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      accuracy INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await sql`
      SELECT id, user_email, user_name, user_role, label, latitude, longitude, accuracy, updated_at
      FROM live_gps_locations
      WHERE updated_at >= NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not fetch live GPS locations.", error: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));
    const email = String(body.user_email || "").trim().toLowerCase();
    const name = String(body.user_name || "Estate User").trim();
    const role = String(body.user_role || "Resident").trim();
    const label = String(body.label || "").trim();
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    const acc = Number.isFinite(Number(body.accuracy)) ? Math.round(Number(body.accuracy)) : 0;

    if (!email || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { message: "user_email, latitude, and longitude are required." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO live_gps_locations (user_email, user_name, user_role, label, latitude, longitude, accuracy, updated_at)
      VALUES (${email}, ${name}, ${role}, ${label}, ${lat}, ${lng}, ${acc}, NOW())
      ON CONFLICT (user_email) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_role = EXCLUDED.user_role,
        label = EXCLUDED.label,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        accuracy = EXCLUDED.accuracy,
        updated_at = NOW()
      RETURNING id, user_email, user_name, user_role, label, latitude, longitude, accuracy, updated_at
    `;

    return NextResponse.json({ data: rows[0] });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not save live GPS location.", error: err?.message },
      { status: 500 }
    );
  }
}
