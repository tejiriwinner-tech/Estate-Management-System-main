import { connection, NextResponse } from "next/server";

const previewDashboard = {
  merchant: {
    name: "Kinetic Commerce",
    merchantId: "KC-8842",
    joinedAt: "2023-10-24",
    tier: "Premier Merchant",
    totalRevenue: "14250000.00",
    pendingSettlements: "842000.00",
    activeProducts: 1248,
    orderVolume: 4821,
    settlementMode: "Bank Transfer",
    settlementFrequency: "Quarterly",
    autoPayEnabled: false,
    documentName: "Lease Agreement",
  },
  transactions: [
    {
      id: 1,
      service: "Premium Insurance",
      invoice: "INV-#4402",
      amount: "45000.00",
      date: "2023-10-24",
      status: "paid",
    },
    {
      id: 2,
      service: "Warehousing Fee",
      invoice: "INV-#4401",
      amount: "12500.00",
      date: "2023-09-28",
      status: "paid",
    },
    {
      id: 3,
      service: "Logistics Bulk",
      invoice: "INV-#4398",
      amount: "25000.00",
      date: "2023-09-15",
      status: "paid",
    },
  ],
  urgentAction: {
    title: "Quarterly Service Fee (Q4)",
    amount: "150000.00",
    dueDate: "2023-11-15",
    overdueDays: 12,
  },
  nextBillingDate: "2023-12-20",
};

export async function GET(request: Request) {
  await connection();

  const isDevelopmentPreview =
    process.env.NODE_ENV !== "production" &&
    new URL(request.url).searchParams.get("preview") === "1";

  if (process.env.DASHBOARD_PREVIEW === "true" || isDevelopmentPreview) {
    return NextResponse.json({ data: previewDashboard, preview: true });
  }

  const endpoint =
    process.env.LARAVEL_API_URL ??
    "http://127.0.0.1:8000/api/store/dashboard";

  let upstream: Response;

  try {
    upstream = await fetch(endpoint, { cache: "no-store" });
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "Unknown connection error";

    console.error("Laravel dashboard API request failed:", details);

    return NextResponse.json(
      {
        error: `Could not connect to the Laravel API at ${endpoint}. ${details}`,
      },
      { status: 502 },
    );
  }

  let payload: unknown;

  try {
    payload = await upstream.json();
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "Invalid JSON response";

    console.error("Laravel dashboard API returned invalid JSON:", details);

    return NextResponse.json(
      { error: "The Laravel API returned an invalid response." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: `The Laravel API returned HTTP ${upstream.status}.`,
      },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload);
}
