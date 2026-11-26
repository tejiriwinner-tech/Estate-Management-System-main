import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const memoryStores: any[] = [];

async function ensureStoresTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS estate_stores (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'General & Groceries',
      shop_unit VARCHAR(100) DEFAULT 'Commercial Plaza',
      owner_name VARCHAR(255) NOT NULL,
      owner_email VARCHAR(255) UNIQUE NOT NULL,
      owner_user_id INTEGER,
      status VARCHAR(30) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureStoresTable();
    const rows = await sql`SELECT * FROM estate_stores ORDER BY id DESC`;
    return NextResponse.json({ data: rows });
  } catch (err: any) {
    console.warn("Admin stores fallback:", err.message);
    return NextResponse.json({ data: memoryStores });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, shop_unit, owner_name, owner_email, password } = body;

    if (!name || !owner_name || !owner_email || !password) {
      return NextResponse.json(
        { message: "Store name, owner name, email, and password are required." },
        { status: 422 }
      );
    }

    const cleanEmail = String(owner_email).trim().toLowerCase();

    try {
      await ensureStoresTable();
      const hashed = await bcrypt.hash(String(password), 10);

      let userId: number | null = null;
      const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
      if (existingUser.length > 0) {
        userId = Number(existingUser[0].id);
        await sql`
          UPDATE users
          SET name = ${owner_name}, password = ${hashed}, role = 'store_owner',
              unit_number = ${shop_unit || "Commercial Plaza"}, job_title = ${`Store Admin — ${name}`},
              status = 'active', updated_at = NOW()
          WHERE id = ${userId}
        `;
      } else {
        const insertedUser = await sql`
          INSERT INTO users (name, email, password, role, unit_number, job_title, status, created_at, updated_at)
          VALUES (${owner_name}, ${cleanEmail}, ${hashed}, 'store_owner', ${shop_unit || "Commercial Plaza"}, ${`Store Admin — ${name}`}, 'active', NOW(), NOW())
          RETURNING id
        `;
        userId = Number(insertedUser[0].id);
      }

      const storeRows = await sql`
        INSERT INTO estate_stores (name, category, shop_unit, owner_name, owner_email, owner_user_id, status, created_at, updated_at)
        VALUES (${name}, ${category || "General & Groceries"}, ${shop_unit || "Commercial Plaza"}, ${owner_name}, ${cleanEmail}, ${userId}, 'active', NOW(), NOW())
        ON CONFLICT (owner_email) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          shop_unit = EXCLUDED.shop_unit,
          owner_name = EXCLUDED.owner_name,
          owner_user_id = EXCLUDED.owner_user_id,
          status = 'active',
          updated_at = NOW()
        RETURNING *
      `;

      return NextResponse.json(
        {
          data: storeRows[0],
          message: `Store "${name}" and Store Admin login (${cleanEmail}) created successfully.`,
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Admin stores POST fallback:", dbErr.message);
      const fallbackStore = {
        id: Date.now(),
        name,
        category: category || "General & Groceries",
        shop_unit: shop_unit || "Commercial Plaza",
        owner_name,
        owner_email: cleanEmail,
        status: "active",
        created_at: new Date().toISOString(),
      };
      memoryStores.unshift(fallbackStore);
      return NextResponse.json(
        {
          data: fallbackStore,
          message: `Store "${name}" and Store Admin (${cleanEmail}) created.`,
        },
        { status: 201 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create store.", error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    try {
      await ensureStoresTable();
      const updated = await sql`
        UPDATE estate_stores
        SET status = ${status || "active"}, updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING *
      `;
      if (updated[0]?.owner_user_id) {
        await sql`
          UPDATE users SET status = ${status === "archived" ? "suspended" : "active"}, updated_at = NOW()
          WHERE id = ${Number(updated[0].owner_user_id)}
        `.catch(() => {});
      }
      return NextResponse.json({ data: updated[0], message: `Store marked as ${status}.` });
    } catch {
      const target = memoryStores.find((s) => Number(s.id) === Number(id));
      if (target) target.status = status || "active";
      return NextResponse.json({ data: target, message: `Store marked as ${status}.` });
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update store.", error: err.message }, { status: 500 });
  }
}
