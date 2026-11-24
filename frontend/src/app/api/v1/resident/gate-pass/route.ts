import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    data: {
      passId: "RES-VILLAA402",
      residentName: "Chinedu Resident",
      unitNumber: "Villa A-402",
      vehiclePlate: "KJA-492AA",
      status: "ACTIVE",
      clearance: "Verified Resident",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      residentName = "Chinedu Resident",
      unitNumber = "Villa A-402",
      vehiclePlate = "KJA-492AA",
      direction = "out",
      code = "RES-VILLAA402",
    } = body;

    try {
      await sql`
        INSERT INTO access_logs (person_name, role, gate, status, verification_type, notes, created_at)
        VALUES (
          ${residentName},
          'Resident',
          'Main Gate 1',
          'Granted',
          ${direction === "out" ? "QR Exit Pass" : "QR Entry Pass"},
          ${`Unit: ${unitNumber} | Vehicle: ${vehiclePlate} | Code: ${code}`},
          NOW()
        )
      `;
    } catch (e: any) {
      console.warn("Gate pass DB log notice:", e.message);
    }

    return NextResponse.json({
      ok: true,
      message: `Gate security pre-cleared for ${residentName} (${direction.toUpperCase()}).`,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not signal gate.", error: err.message }, { status: 500 });
  }
}
