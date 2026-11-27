import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { ServiceManagementData } from "@/types/serviceManagement";

export const dynamic = "force-dynamic";

let servicesTableEnsured = false;

async function ensureFinServicesTable() {
  if (servicesTableEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS fin_service_charges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      fee_kobo BIGINT NOT NULL DEFAULT 0,
      frequency VARCHAR(50) DEFAULT 'Monthly',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE fin_service_charges ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'`;
  await sql`ALTER TABLE fin_service_charges ADD COLUMN IF NOT EXISTS fee_kobo BIGINT DEFAULT 0`;
  await sql`ALTER TABLE fin_service_charges ADD COLUMN IF NOT EXISTS frequency VARCHAR(50) DEFAULT 'Monthly'`;
  await sql`ALTER TABLE fin_service_charges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
  await sql`ALTER TABLE fin_service_charges ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`;
  await sql`ALTER TABLE fin_service_charges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`;
  servicesTableEnsured = true;
}

export async function GET() {
  try {
    await ensureFinServicesTable();
    const rows = await sql`
      SELECT * FROM fin_service_charges ORDER BY id DESC
    `;

    const services = rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      category: r.category || "General",
      fee: Number(r.fee_kobo || 0) / 100,
      frequency: r.frequency || "Monthly",
      status: r.is_active ? ("Active" as const) : ("Inactive" as const),
      dateCreated: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
    }));

    const active = services.filter((s) => s.status === "Active").length;
    const totalExpected = services
      .filter((s) => s.status === "Active")
      .reduce((acc, s) => acc + s.fee, 0);

    const data: ServiceManagementData = {
      kpis: {
        totalServices: services.length,
        activeServices: active,
        inactiveServices: services.length - active,
        expectedRevenue: `₦${totalExpected.toLocaleString()}/mo`,
      },
      services,
      forecastText:
        services.length > 0
          ? "Projected monthly service revenue based on active billing across registered units."
          : "No estate services configured yet. Add a service to begin billing.",
      quickTipText: "Service levy adjustments automatically reflect on subsequent invoice cycles.",
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureFinServicesTable();
    const body = await req.json();
    const feeKobo = Math.round(Number(body.fee || 0) * 100);
    const isActive = body.status ? body.status === "Active" : true;

    const inserted = await sql`
      INSERT INTO fin_service_charges (name, category, fee_kobo, frequency, is_active, created_at, updated_at)
      VALUES (${body.name}, ${body.category || "General"}, ${feeKobo}, ${body.frequency || "Monthly"}, ${isActive}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: inserted[0], service: inserted[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create service.", error: err.message }, { status: 500 });
  }
}
