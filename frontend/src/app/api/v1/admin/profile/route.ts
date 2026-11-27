import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureSettingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS estate_settings (
      id INT PRIMARY KEY DEFAULT 1,
      estate_name VARCHAR(255) DEFAULT 'Post Army Housing Estate',
      support_phone VARCHAR(60) DEFAULT '',
      default_due_days INT DEFAULT 14,
      auto_approve_listings BOOLEAN DEFAULT false,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(req: NextRequest) {
  try {
    await ensureSettingsTable();
    const email = req.headers.get("x-user-email")?.trim().toLowerCase() || "";

    const userRows = email
      ? await sql`SELECT id, name, email, phone, job_title, avatar_url FROM users WHERE LOWER(email) = ${email} LIMIT 1`
      : await sql`SELECT id, name, email, phone, job_title, avatar_url FROM users WHERE LOWER(role) = 'admin' ORDER BY id ASC LIMIT 1`;

    const settingsRows = await sql`SELECT * FROM estate_settings WHERE id = 1 LIMIT 1`;

    return NextResponse.json({
      data: {
        profile: userRows[0] || {
          name: "Administrator",
          email: email || "admin@lincolnestate.ng",
          phone: "",
          job_title: "Estate Manager",
          avatar_url: "",
        },
        settings: settingsRows[0] || {
          estate_name: "Post Army Housing Estate",
          support_phone: "",
          default_due_days: 14,
          auto_approve_listings: false,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not load admin profile.", error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureSettingsTable();
    const body = await req.json();
    const email = (req.headers.get("x-user-email") || body.email || "").trim().toLowerCase();

    if (body.name || body.job_title !== undefined || body.phone !== undefined || body.avatar_url !== undefined) {
      if (email) {
        await sql`
          UPDATE users
          SET
            name = COALESCE(${body.name ?? null}, name),
            job_title = COALESCE(${body.job_title ?? null}, job_title),
            phone = COALESCE(${body.phone ?? null}, phone),
            avatar_url = ${body.avatar_url === "" ? null : body.avatar_url ?? null},
            updated_at = NOW()
          WHERE LOWER(email) = ${email}
        `;
      } else {
        await sql`
          UPDATE users
          SET
            name = COALESCE(${body.name ?? null}, name),
            job_title = COALESCE(${body.job_title ?? null}, job_title),
            phone = COALESCE(${body.phone ?? null}, phone),
            avatar_url = ${body.avatar_url === "" ? null : body.avatar_url ?? null},
            updated_at = NOW()
          WHERE id = (SELECT id FROM users WHERE LOWER(role) = 'admin' ORDER BY id ASC LIMIT 1)
        `;
      }
    }

    if (body.new_password) {
      const hashed = await bcrypt.hash(String(body.new_password), 10);
      if (email) {
        await sql`UPDATE users SET password = ${hashed}, updated_at = NOW() WHERE LOWER(email) = ${email}`;
      }
    }

    if (body.settings) {
      const s = body.settings;
      await sql`
        INSERT INTO estate_settings (id, estate_name, support_phone, default_due_days, auto_approve_listings, updated_at)
        VALUES (
          1,
          ${s.estate_name || "Post Army Housing Estate"},
          ${s.support_phone || ""},
          ${Number(s.default_due_days || 14)},
          ${Boolean(s.auto_approve_listings)},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          estate_name = EXCLUDED.estate_name,
          support_phone = EXCLUDED.support_phone,
          default_due_days = EXCLUDED.default_due_days,
          auto_approve_listings = EXCLUDED.auto_approve_listings,
          updated_at = NOW()
      `;
    }

    return NextResponse.json({ success: true, message: "Admin profile & settings saved." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save admin settings.", error: err?.message }, { status: 500 });
  }
}
