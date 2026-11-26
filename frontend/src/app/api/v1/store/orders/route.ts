import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const memoryOrders: any[] = [];

async function ensureOrdersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS store_orders (
      id SERIAL PRIMARY KEY,
      order_no VARCHAR(50) NOT NULL,
      store_id INTEGER DEFAULT 1,
      product_id INTEGER,
      product_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      total_naira NUMERIC(12, 2) NOT NULL DEFAULT 0,
      resident_name VARCHAR(255) NOT NULL,
      resident_email VARCHAR(255),
      unit_number VARCHAR(100) DEFAULT 'Estate Unit',
      delivery_comment TEXT,
      payment_method VARCHAR(80) DEFAULT 'Bank Transfer',
      payment_reference VARCHAR(120),
      payment_proof_url TEXT,
      payment_proof_name VARCHAR(255),
      status VARCHAR(40) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(80) DEFAULT 'Bank Transfer'`;
  await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(120)`;
  await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT`;
  await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_proof_name VARCHAR(255)`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") || "").toLowerCase().trim();

  try {
    await ensureOrdersTable();

    const rows = email
      ? await sql`SELECT * FROM store_orders WHERE LOWER(resident_email) = ${email} ORDER BY id DESC LIMIT 30`
      : await sql`SELECT * FROM store_orders ORDER BY id DESC LIMIT 30`;

    return NextResponse.json({
      data: rows.map((r: any) => ({
        id: Number(r.id),
        order_no: r.order_no,
        product_id: r.product_id,
        product_name: r.product_name,
        quantity: Number(r.quantity),
        total_naira: Number(r.total_naira),
        resident_name: r.resident_name,
        resident_email: r.resident_email,
        unit_number: r.unit_number,
        delivery_comment: r.delivery_comment || "",
        payment_method: r.payment_method || "Bank Transfer",
        payment_reference: r.payment_reference || "",
        payment_proof_url: r.payment_proof_url || null,
        payment_proof_name: r.payment_proof_name || null,
        status: r.status || "Pending",
        created_at: r.created_at,
      })),
    });
  } catch (err: any) {
    console.warn("Store orders GET fallback:", err.message);
    const filtered = email
      ? memoryOrders.filter((o) => (o.resident_email || "").toLowerCase() === email)
      : memoryOrders;
    return NextResponse.json({ data: filtered });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product_id,
      product_name,
      quantity = 1,
      unit_price = 0,
      resident_name = "Estate Resident",
      resident_email = "resident@lincolnestate.ng",
      unit_number = "Estate Unit",
      delivery_comment = "",
      payment_method = "Bank Transfer",
      payment_reference = "",
      payment_proof_url = "",
      payment_proof_name = "",
    } = body;

    if (!String(payment_reference).trim() && !String(payment_proof_url).trim()) {
      return NextResponse.json(
        { message: "Proof of payment (transaction reference or receipt upload) is required before confirming your order." },
        { status: 422 }
      );
    }

    const qty = Math.max(1, Number(quantity));
    const total = qty * Number(unit_price);
    const orderNo = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await ensureOrdersTable();
      const inserted = await sql`
        INSERT INTO store_orders (
          order_no, store_id, product_id, product_name, quantity, total_naira,
          resident_name, resident_email, unit_number, delivery_comment,
          payment_method, payment_reference, payment_proof_url, payment_proof_name, status
        )
        VALUES (
          ${orderNo}, 1, ${product_id ? Number(product_id) : null}, ${product_name || "Store Item"},
          ${qty}, ${total}, ${resident_name}, ${String(resident_email).toLowerCase()},
          ${unit_number}, ${delivery_comment},
          ${payment_method}, ${String(payment_reference).trim()}, ${payment_proof_url || null}, ${payment_proof_name || null}, 'Pending'
        )
        RETURNING *
      `;

      if (product_id) {
        await sql`
          UPDATE store_products
          SET stock = GREATEST(0, COALESCE(stock, 0) - ${qty}), updated_at = NOW()
          WHERE id = ${Number(product_id)}
        `.catch(() => {});
      }

      return NextResponse.json(
        { data: inserted[0], message: `Order ${orderNo} confirmed with payment proof! The store has received your order.` },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Store orders POST fallback:", dbErr.message);
      const fallbackOrder = {
        id: Date.now(),
        order_no: orderNo,
        product_id,
        product_name: product_name || "Store Item",
        quantity: qty,
        total_naira: total,
        resident_name,
        resident_email: String(resident_email).toLowerCase(),
        unit_number,
        delivery_comment,
        payment_method,
        payment_reference,
        payment_proof_url,
        payment_proof_name,
        status: "Pending",
        created_at: new Date().toISOString(),
      };
      memoryOrders.unshift(fallbackOrder);
      return NextResponse.json(
        { data: fallbackOrder, message: `Order ${orderNo} confirmed with payment proof!` },
        { status: 201 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not place order.", error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ message: "Order id and status are required." }, { status: 400 });
    }
    try {
      await ensureOrdersTable();
      await sql`UPDATE store_orders SET status = ${status}, updated_at = NOW() WHERE id = ${Number(id)}`;
    } catch {
      const idx = memoryOrders.findIndex((o) => o.id === Number(id));
      if (idx >= 0) memoryOrders[idx].status = status;
    }
    return NextResponse.json({ message: `Order updated to ${status}.` });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update order.", error: err.message }, { status: 500 });
  }
}
