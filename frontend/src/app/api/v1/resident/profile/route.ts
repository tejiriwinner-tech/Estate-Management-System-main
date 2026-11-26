import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const emailHeader = (req.headers.get("x-user-email") || "").toLowerCase().trim();
    let profile = {
      id: 2,
      name: "Estate Resident",
      email: emailHeader || "resident@lincolnestate.ng",
      phone: "",
      unit_number: "Estate Unit",
      avatar_url: null as string | null,
      cover_url: null as string | null,
      resident_code: "PAHE-RES-0000",
      about: "",
      settings: {
        sms_notifications: true,
        email_notifications: true,
        members_can_chat: true,
      },
    };

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT`;
      const rows = emailHeader
        ? await sql`
            SELECT id, name, email, phone, unit_number, avatar_url, cover_url, job_title
            FROM users
            WHERE LOWER(email) = ${emailHeader}
            LIMIT 1
          `
        : await sql`
            SELECT id, name, email, phone, unit_number, avatar_url, cover_url, job_title
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
          avatar_url: u.avatar_url || null,
          cover_url: u.cover_url || null,
          resident_code: `PAHE-RES-${String(u.id).padStart(4, "0")}`,
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, unit_number, avatar_url, cover_url, email } = body;
    const targetEmail = (email || req.headers.get("x-user-email") || "").toLowerCase().trim();

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT`;
      if (targetEmail) {
        await sql`
          UPDATE users
          SET name = COALESCE(${name ?? null}, name),
              phone = COALESCE(${phone ?? null}, phone),
              unit_number = COALESCE(${unit_number ?? null}, unit_number),
              avatar_url = COALESCE(${avatar_url ?? null}, avatar_url),
              cover_url = COALESCE(${cover_url ?? null}, cover_url),
              updated_at = NOW()
          WHERE LOWER(email) = ${targetEmail}
        `;
      } else {
        await sql`
          UPDATE users
          SET name = COALESCE(${name ?? null}, name),
              phone = COALESCE(${phone ?? null}, phone),
              unit_number = COALESCE(${unit_number ?? null}, unit_number),
              avatar_url = COALESCE(${avatar_url ?? null}, avatar_url),
              cover_url = COALESCE(${cover_url ?? null}, cover_url),
              updated_at = NOW()
          WHERE role = 'resident'
        `;
      }
    } catch (e: any) {
      console.error("Profile update error:", e.message);
    }

    return NextResponse.json({ message: "Profile updated successfully.", data: body });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update profile.", error: err.message }, { status: 500 });
  }
}
