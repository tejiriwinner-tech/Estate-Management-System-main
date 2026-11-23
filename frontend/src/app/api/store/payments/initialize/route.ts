import { connection, NextResponse } from "next/server";
import { checkoutItems, checkoutTotal } from "@/app/(store)/store-app/lib/checkout";

type CheckoutDetails = {
  name: string;
  email: string;
};

function isCheckoutDetails(value: unknown): value is CheckoutDetails {
  if (!value || typeof value !== "object") {
    return false;
  }

  const details = value as Record<string, unknown>;

  return (
    typeof details.name === "string" &&
    details.name.trim().length >= 2 &&
    details.name.trim().length <= 100 &&
    typeof details.email === "string" &&
    details.email.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
  );
}

export async function POST(request: Request) {
  await connection();

  const origin = request.headers.get("origin");
  let requestOrigin: string;

  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return NextResponse.json(
      { error: "Checkout requests must come from this site." },
      { status: 403 },
    );
  }

  let suppliedOrigin: string;

  try {
    suppliedOrigin = origin ? new URL(origin).origin : "";
  } catch {
    suppliedOrigin = "";
  }

  if (!origin || suppliedOrigin !== requestOrigin) {
    return NextResponse.json(
      { error: "Checkout requests must come from this site." },
      { status: 403 },
    );
  }

  let details: unknown;

  try {
    details = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter a valid name and email address to continue." },
      { status: 400 },
    );
  }

  if (!isCheckoutDetails(details)) {
    return NextResponse.json(
      { error: "Enter a valid name and email address to continue." },
      { status: 422 },
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Paystack is not configured. Add PAYSTACK_SECRET_KEY to frontend/.env.local, then restart Next.js.",
      },
      { status: 503 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  let paystackResponse: Response;

  try {
    paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: details.email.trim(),
          amount: checkoutTotal * 100,
          currency: "NGN",
          callback_url: new URL("/checkout", baseUrl).toString(),
          channels: ["card", "bank", "ussd", "bank_transfer"],
          metadata: {
            customer_name: details.name.trim(),
            items: checkoutItems.map(({ name, price }) => ({ name, price })),
          },
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The payment request failed.";
    console.error("Paystack initialization request failed:", message);

    return NextResponse.json(
      { error: "Paystack could not be reached. Please try again." },
      { status: 502 },
    );
  }

  let result: unknown;

  try {
    result = await paystackResponse.json();
  } catch {
    return NextResponse.json(
      { error: "Paystack returned an unreadable response. Please try again." },
      { status: 502 },
    );
  }

  if (!paystackResponse.ok || !result || typeof result !== "object") {
    console.error("Paystack initialization returned an unsuccessful response.");

    return NextResponse.json(
      { error: "Paystack could not start this payment. Please try again." },
      { status: 502 },
    );
  }

  const payload = result as {
    status?: unknown;
    message?: unknown;
    data?: { authorization_url?: unknown };
  };
  const authorizationUrl = payload.data?.authorization_url;
  let parsedAuthorizationUrl: URL | undefined;

  if (typeof authorizationUrl === "string") {
    try {
      parsedAuthorizationUrl = new URL(authorizationUrl);
    } catch {
      parsedAuthorizationUrl = undefined;
    }
  }

  if (
    payload.status !== true ||
    !parsedAuthorizationUrl ||
    parsedAuthorizationUrl.hostname !== "checkout.paystack.com" ||
    parsedAuthorizationUrl.protocol !== "https:"
  ) {
    console.error("Paystack did not return a valid hosted checkout URL.");

    return NextResponse.json(
      { error: "Paystack did not return a valid checkout link." },
      { status: 502 },
    );
  }

  return NextResponse.json({ authorizationUrl });
}
