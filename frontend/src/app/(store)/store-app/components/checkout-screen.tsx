"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  checkoutCustomerStorageKey,
  checkoutDiscount,
  checkoutItems,
  checkoutPlatformFee,
  checkoutSubtotal,
  checkoutTotal,
  formatNaira,
} from "../lib/checkout";
import { useSiteSettings } from "./site-settings";
import { StoreShell } from "./store-screens";

type PaymentState = "idle" | "initializing" | "verifying" | "paid";

type VerifiedReceipt = {
  reference: string;
  amount: number;
  currency: "NGN";
  customerName: string | null;
  customerEmail: string | null;
  paidAt: string | null;
};

export function CheckoutScreen() {
  const { settings } = useSiteSettings();
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<VerifiedReceipt | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const rawPhone = settings.supportPhone.replace(/\D/g, "");
  const whatsappNumber =
    rawPhone.length === 11 && rawPhone.startsWith("0")
      ? `234${rawPhone.slice(1)}`
      : rawPhone;
  const receiptPreview: VerifiedReceipt = receipt ?? {
    reference: "",
    amount: checkoutTotal,
    currency: "NGN",
    customerName: settings.profileName || null,
    customerEmail: settings.profileEmail || null,
    paidAt: null,
  };

  useEffect(() => {
    if (!isReceiptOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsReceiptOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReceiptOpen]);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");

    if (!reference) {
      return;
    }

    const controller = new AbortController();

    async function verifyPayment() {
      setPaymentState("verifying");
      setError("");

      try {
        const response = await fetch(
          `/api/store/payments/verify?reference=${encodeURIComponent(reference ?? "")}`,
          { cache: "no-store", signal: controller.signal },
        );
        const result: {
          verified?: boolean;
          error?: string;
          receipt?: VerifiedReceipt;
        } =
          await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "The payment could not be verified.");
        }

        if (!result.verified || !result.receipt) {
          throw new Error(
            "Paystack has not confirmed this payment. No order has been completed.",
          );
        }

        let customerName: string | null = null;
        let customerEmail: string | null = null;
        try {
          const storedDetails = window.sessionStorage.getItem(
            checkoutCustomerStorageKey,
          );
          if (storedDetails) {
            const details: unknown = JSON.parse(storedDetails);
            if (!details || typeof details !== "object" || Array.isArray(details)) {
              throw new Error("Saved checkout details are invalid.");
            }
            const customer = details as Record<string, unknown>;
            if (typeof customer.name !== "string" || typeof customer.email !== "string") {
              throw new Error("Saved checkout details are invalid.");
            }

            customerName = customer.name;
            customerEmail = customer.email;
            window.sessionStorage.removeItem(checkoutCustomerStorageKey);
          }
        } catch (detailsError) {
          console.error("Checkout receipt details could not be restored:", detailsError);
          setError(
            "Payment was verified, but your name and email could not be restored to the receipt.",
          );
        }

        setReceipt({ ...result.receipt, customerName, customerEmail });
        setPaymentState("paid");
        window.history.replaceState({}, "", "/store-app/checkout");
      } catch (verificationError) {
        if (controller.signal.aborted) {
          return;
        }

        setPaymentState("idle");
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "The payment could not be verified with Paystack.",
        );
      }
    }

    void verifyPayment();

    return () => controller.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPaymentState("initializing");

    const values = new FormData(event.currentTarget);
    const customerDetails = {
      name: String(values.get("name") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/store/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerDetails),
      });
      const result: { authorizationUrl?: string; error?: string } =
        await response.json();

      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result.error ?? "Paystack could not start this payment.");
      }

      try {
        window.sessionStorage.setItem(
          checkoutCustomerStorageKey,
          JSON.stringify(customerDetails),
        );
      } catch {
        throw new Error(
          "This browser could not save receipt details for checkout. Enable session storage and try again.",
        );
      }

      window.location.assign(result.authorizationUrl);
    } catch (checkoutError) {
      setPaymentState("idle");
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Paystack checkout could not be started.",
      );
    }
  }

  function handleDownloadReceipt() {
    if (!receipt) {
      return;
    }

    try {
      downloadReceipt(receipt, settings.siteName);
      setError("");
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "The receipt could not be downloaded.",
      );
    }
  }

  if (paymentState === "paid") {
    return (
      <StoreShell>
        <section className="checkout-success receipt-success">
          <span aria-hidden="true">✓</span>
          <p className="screen-kicker">PAYMENT CONFIRMED · PAYSTACK</p>
          <h1>Thank you for your payment</h1>
          <p>
            Paystack verified your payment. Your receipt is ready to view and
            share with the administrator.
          </p>
          {receipt && (
            <div className="receipt-actions">
              <button
                className="button button--primary"
                onClick={() => setIsReceiptOpen(true)}
                type="button"
              >
                <span aria-hidden="true" className="receipt-preview-icon">
                  <svg
                    fill="none"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path
                      d="M7 3.75h8l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M15 3.75v4h4M9 12h6M9 15.5h6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />
                  </svg>
                </span>
                <span className="receipt-preview-copy">
                  <strong>View receipt</strong>
                  <small>Review your order and share it with the admin</small>
                </span>
                <span aria-hidden="true" className="receipt-preview-arrow">
                  →
                </span>
              </button>
            </div>
          )}
          {error && <div className="screen-error" role="alert">{error}</div>}
          <Link className="button button--primary" href="/store-app/store">
            Return to the store
          </Link>
        </section>
        {receipt && isReceiptOpen && (
          <ReceiptModal
            businessName={settings.siteName}
            error={error}
            isPaid
            onClose={() => setIsReceiptOpen(false)}
            onDownload={handleDownloadReceipt}
            receipt={receipt}
            whatsappNumber={whatsappNumber}
          />
        )}
      </StoreShell>
    );
  }

  return (
    <StoreShell activeNav="Finance">
      <div className="checkout-heading">
        <span className="screen-kicker">SECURE CHECKOUT · PAYSTACK</span>
        <h1>Review your order</h1>
        <p>Confirm your details, then pay securely in Nigerian Naira.</p>
      </div>

      {paymentState === "verifying" && (
        <div className="screen-notice" role="status">
          Confirming your Paystack payment…
        </div>
      )}
      {error && (
        <div className="screen-error" role="alert">
          {error}
        </div>
      )}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <section className="screen-card checkout-section">
            <div className="checkout-section-heading">
              <span aria-hidden="true">▣</span>
              <h2>Customer details</h2>
            </div>
            <div className="form-grid">
              <label>
                Full name
                <input
                  autoComplete="name"
                  defaultValue={settings.profileName}
                  maxLength={100}
                  minLength={2}
                  name="name"
                  required
                />
              </label>
              <label>
                Email address
                <input
                  autoComplete="email"
                  defaultValue={settings.profileEmail}
                  maxLength={255}
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label className="form-span">
                Street address
                <input
                  autoComplete="street-address"
                  defaultValue={settings.officeAddress}
                  maxLength={160}
                  name="address"
                  required
                />
              </label>
              <label>
                City
                <input
                  autoComplete="address-level2"
                  defaultValue={settings.city}
                  maxLength={80}
                  name="city"
                  required
                />
              </label>
              <label>
                State
                <select
                  autoComplete="address-level1"
                  defaultValue={settings.state}
                  name="state"
                  required
                >
                  {nigerianStates.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label>
                Postal code
                <input
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={10}
                  name="postalCode"
                  placeholder="101241"
                  required
                />
              </label>
            </div>
          </section>

          <section className="screen-card checkout-section payment-provider-card">
            <div className="checkout-section-heading">
              <span aria-hidden="true">₦</span>
              <h2>Pay with Paystack</h2>
            </div>
            <p className="form-help">
              You&apos;ll be redirected to Paystack to securely complete payment
              by card, bank transfer, or USSD. {settings.siteName || "This business"} never receives your card details.
            </p>
          </section>

          <button
            className="button button--primary checkout-submit"
            disabled={paymentState !== "idle"}
            type="submit"
          >
            {paymentState === "initializing"
              ? "Connecting to Paystack…"
              : `Continue to Paystack · ${formatNaira(checkoutTotal)}`}
          </button>
        </form>

        <aside className="checkout-aside">
          <section className="screen-card order-summary">
            <div className="order-summary-title">
              <h2>Your order</h2>
              <span>{checkoutItems.length} ITEMS</span>
            </div>
            {checkoutItems.map((item) => (
              <div className="checkout-item" key={item.name}>
                <Image
                  alt=""
                  height={52}
                  src={item.image}
                  width={64}
                />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </span>
                <b>{formatNaira(item.price)}</b>
              </div>
            ))}
            <div className="checkout-totals">
              <span>
                Subtotal <b>{formatNaira(checkoutSubtotal)}</b>
              </span>
              <span>
                Processing fee <b>{formatNaira(checkoutPlatformFee)}</b>
              </span>
              <span>
                Welcome discount <b>−{formatNaira(checkoutDiscount)}</b>
              </span>
              <strong>
                Total amount <b>{formatNaira(checkoutTotal)}</b>
              </strong>
            </div>
            <button
              className="button button--outline receipt-preview-button"
              onClick={() => setIsReceiptOpen(true)}
              type="button"
            >
              View receipt
            </button>
            <small className="payment-caption">
              Payments are processed securely by Paystack in NGN.
            </small>
          </section>
          <section className="screen-card acquisition-site">
            <Image
              alt=""
              height={40}
              src="/assets/products/checkout-3.jpeg"
              width={56}
            />
            <span>
              <small>PROPERTY COLLECTION</small>
              <strong>Lekki, Lagos</strong>
            </span>
          </section>
          <Link className="checkout-back-link" href="/store-app/subscription">
            ← Back to subscription plans
          </Link>
        </aside>
      </div>
      {isReceiptOpen && (
        <ReceiptModal
          businessName={settings.siteName}
          isPaid={false}
          onClose={() => setIsReceiptOpen(false)}
          receipt={receiptPreview}
          whatsappNumber={whatsappNumber}
        />
      )}
    </StoreShell>
  );
}

type ReceiptModalProps = {
  businessName: string;
  error?: string;
  isPaid: boolean;
  onClose: () => void;
  onDownload?: () => void;
  receipt: VerifiedReceipt;
  whatsappNumber: string;
};

function ReceiptModal({
  businessName,
  error,
  isPaid,
  onClose,
  onDownload,
  receipt,
  whatsappNumber,
}: ReceiptModalProps) {
  const whatsappMessage = encodeURIComponent(
    isPaid
      ? `${businessName || "Business"} payment receipt ${receipt.reference}.`
      : `${businessName || "Business"} order summary preview. Payment has not been completed.`,
  );
  const hasWhatsappNumber =
    whatsappNumber.length >= 8 && whatsappNumber.length <= 15;

  return (
    <div
      className="receipt-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="receipt-modal-title"
        aria-modal="true"
        className="receipt-modal"
        role="dialog"
      >
        <button
          aria-label="Close receipt"
          className="receipt-modal-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div className="receipt-modal-heading">
          <h2 id="receipt-modal-title">
            {isPaid ? "Payment receipt" : "Receipt preview"}
          </h2>
          <p>
            {isPaid
              ? "Payment verified by Paystack"
              : "Preview only — payment has not been completed"}
          </p>
        </div>
        <article className="receipt-card">
          <div className="receipt-card-heading">
            <span>{businessName || "Business"}</span>
            <strong>{isPaid ? "PAYMENT RECEIPT" : "RECEIPT PREVIEW"}</strong>
          </div>
          <dl>
            <div>
              <dt>Payment status</dt>
              <dd>{isPaid ? "Paid · Paystack" : "Not paid"}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{isPaid ? receipt.reference : "Assigned after payment"}</dd>
            </div>
            <div>
              <dt>Customer</dt>
              <dd>{receipt.customerName || "—"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{receipt.customerEmail || "—"}</dd>
            </div>
            {isPaid && (
              <div>
                <dt>Date</dt>
                <dd>{formatReceiptDate(receipt.paidAt)}</dd>
              </div>
            )}
          </dl>
          <div className="receipt-items">
            {checkoutItems.map((item) => (
              <div key={item.name}>
                <span>{item.name}</span>
                <strong>{formatNaira(item.price)}</strong>
              </div>
            ))}
            <div className="receipt-total">
              <span>{isPaid ? "Total paid" : "Order total"}</span>
              <strong>{formatNaira(receipt.amount)}</strong>
            </div>
          </div>
        </article>
        <div className="receipt-actions">
          {isPaid && onDownload && (
            <button
              className="button button--outline"
              onClick={onDownload}
              type="button"
            >
              Download receipt
            </button>
          )}
          {hasWhatsappNumber ? (
            <a
              className="button button--primary"
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              rel="noreferrer"
              target="_blank"
            >
              {isPaid
                ? "Share with admin on WhatsApp"
                : "Send order summary to admin on WhatsApp"}
            </a>
          ) : (
            <Link className="button button--primary" href="/store-app/settings">
              Add admin WhatsApp number in Settings
            </Link>
          )}
        </div>
        {hasWhatsappNumber && (
          <small className="receipt-whatsapp-note">
            {isPaid
              ? "To send the receipt file, download it and attach it in the WhatsApp chat."
              : "This is an unpaid preview, not proof of payment."}
          </small>
        )}
        {error && <div className="screen-error" role="alert">{error}</div>}
      </section>
    </div>
  );
}

function formatReceiptDate(value: string | null) {
  if (!value) {
    return "Not provided by Paystack";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

function downloadReceipt(receipt: VerifiedReceipt, businessName: string) {
  const name = businessName.trim() || "Business";
  const itemRows = checkoutItems
    .map(
      (item, index) => `
        <text x="44" y="${300 + index * 48}" class="body">${escapeXml(item.name)}</text>
        <text x="596" y="${300 + index * 48}" class="body" text-anchor="end">${escapeXml(formatNaira(item.price))}</text>`,
    )
    .join("");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="650" viewBox="0 0 640 650">
      <rect width="640" height="650" fill="#f3f4f6"/>
      <rect x="28" y="24" width="584" height="602" rx="18" fill="#fff" stroke="#e5e7eb"/>
      <text x="44" y="76" class="brand">${escapeXml(name)}</text>
      <text x="44" y="111" class="title">PAYMENT RECEIPT</text>
      <rect x="44" y="132" width="90" height="30" rx="15" fill="#e8f5ed"/>
      <text x="89" y="152" class="paid" text-anchor="middle">PAID</text>
      <text x="44" y="202" class="label">PAYMENT REFERENCE</text>
      <text x="44" y="229" class="body">${escapeXml(receipt.reference)}</text>
      <text x="44" y="266" class="label">ITEM</text>
      <text x="596" y="266" class="label" text-anchor="end">AMOUNT</text>
      <line x1="44" y1="278" x2="596" y2="278" stroke="#e5e7eb"/>
      ${itemRows}
      <line x1="44" y1="410" x2="596" y2="410" stroke="#e5e7eb"/>
      <text x="44" y="447" class="body">Total paid</text>
      <text x="596" y="447" class="total" text-anchor="end">${escapeXml(formatNaira(receipt.amount))}</text>
      <text x="44" y="493" class="label">CUSTOMER</text>
      <text x="44" y="518" class="body">${escapeXml(receipt.customerName || "—")}</text>
      <text x="330" y="493" class="label">EMAIL</text>
      <text x="330" y="518" class="body">${escapeXml(receipt.customerEmail || "—")}</text>
      <text x="44" y="558" class="label">PAYMENT DATE</text>
      <text x="44" y="583" class="body">${escapeXml(formatReceiptDate(receipt.paidAt))}</text>
      <text x="596" y="603" class="foot" text-anchor="end">Verified by Paystack · NGN</text>
      <style>
        text{font-family:Arial,Helvetica,sans-serif;fill:#24252b}
        .brand{font-size:20px;font-weight:700}
        .title{font-size:13px;font-weight:700;letter-spacing:2px;fill:#6b7280}
        .paid{font-size:12px;font-weight:700;fill:#207342}
        .label{font-size:10px;font-weight:700;letter-spacing:1px;fill:#7b7f89}
        .body{font-size:14px}
        .total{font-size:20px;font-weight:700}
        .foot{font-size:11px;fill:#7b7f89}
      </style>
    </svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payment-receipt-${receipt.reference.replace(/[^a-zA-Z0-9-]/g, "")}.svg`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const nigerianStates = [
  "Lagos",
  "Abuja",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];
