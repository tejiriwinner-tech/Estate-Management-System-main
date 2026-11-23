import { connection, NextResponse } from "next/server";
import { checkoutTotal } from "@/app/(store)/store-app/lib/checkout";

export async function GET(request: Request) {
  await connection();

  const reference = new URL(request.url).searchParams.get("reference");

  if (!reference || !/^[a-zA-Z0-9._=-]{1,100}$/.test(reference)) {
    return NextResponse.json(
      { error: "A valid Paystack payment reference is required." },
      { status: 400 },
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Paystack verification is not configured on the server." },
      { status: 503 },
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The verification request failed.";
    console.error("Paystack verification request failed:", message);

    return NextResponse.json(
      { error: "Paystack could not be reached to verify this payment." },
      { status: 502 },
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    return NextResponse.json(
      { error: "Paystack returned an unreadable verification response." },
      { status: 502 },
    );
  }

  if (!response.ok || !result || typeof result !== "object") {
    console.error("Paystack verification returned an unsuccessful response.");

    return NextResponse.json(
      { error: "Paystack could not verify this payment reference." },
      { status: 502 },
    );
  }

  const payload = result as {
    status?: unknown;
    data?: {
      status?: unknown;
      amount?: unknown;
      currency?: unknown;
      reference?: unknown;
      paid_at?: unknown;
    };
  };
  const transaction = payload.data;
  const isPaid =
    payload.status === true &&
    transaction?.status === "success" &&
    transaction.currency === "NGN" &&
    transaction.amount === checkoutTotal * 100 &&
    transaction.reference === reference;
  const receipt =
    isPaid && transaction
      ? {
          reference,
          amount: Number(transaction.amount) / 100,
          currency: "NGN",
          customerName: null,
          customerEmail: null,
          paidAt:
            typeof transaction.paid_at === "string"
              ? transaction.paid_at
              : null,
        }
      : undefined;

  return NextResponse.json({
    verified: isPaid,
    status: transaction?.status ?? "unknown",
    receipt,
  });
}
