import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { ServiceManagementData } from "@/types/serviceManagement";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT * FROM fin_service_charges ORDER BY id ASC
      `;
    } catch {
      rows = [];
    }

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
    const totalExpected = services.reduce((acc, s) => acc + s.fee, 0);

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
    const body = await req.json();
    const feeKobo = Math.round(Number(body.fee || 0) * 100);

    const inserted = await sql`
      INSERT INTO fin_service_charges (name, category, fee_kobo, frequency, is_active, created_at, updated_at)
      VALUES (${body.name}, ${body.category || "General"}, ${feeKobo}, ${body.frequency || "Monthly"}, true, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true, service: inserted[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
