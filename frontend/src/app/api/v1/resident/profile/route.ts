import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let profile = {
      id: 2,
      name: "Chinedu Resident",
      email: "resident@lincolnestate.ng",
      phone: "+234 801 234 5678",
      unit_number: "Villa A-402",
      avatar_url: null,
      resident_code: "LE-RES-0402",
      about: "Homeowner in Phase 1, Palm Crescent.",
      settings: {
        sms_notifications: true,
        email_notifications: true,
        members_can_chat: true,
      },
    };

    try {
      const rows = await sql`
        SELECT id, name, email, phone, unit_number, avatar_url, job_title
        FROM users
        WHERE role = 'resident'
        LIMIT 1
      `;
      if (rows.length > 0) {
        const u = rows[0];
        profile = {
          ...profile,
          id: Number(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone || profile.phone,
          unit_number: u.unit_number || profile.unit_number,
          avatar_url: u.avatar_url,
        };
      }
    } catch (e: any) {
      console.error("Profile GET error:", e.message);
    }

    return NextResponse.json({ data: profile });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch profile.", error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, unit_number, about } = body;

    try {
      await sql`
        UPDATE users
        SET name = COALESCE(${name}, name),
            phone = COALESCE(${phone}, phone),
            unit_number = COALESCE(${unit_number}, unit_number),
            updated_at = NOW()
        WHERE role = 'resident'
      `;
    } catch (e: any) {
      console.error("Profile update error:", e.message);
    }

    return NextResponse.json({ message: "Profile updated successfully.", data: body });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update profile.", error: err.message }, { status: 500 });
  }
}
