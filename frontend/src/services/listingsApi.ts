import { readSession } from "@/components/auth/session";
import type { NewListingInput } from "@/types/agentPortal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiListing {
  id: number;
  title: string;
  description: string | null;
  listing_type: "rent" | "sale" | "other";
  property_type: string;
  zone: string;
  address: string;
  beds: number | null;
  baths: number | null;
  price: number; // naira (API stores kobo)
  price_period: string | null;
  availability: string;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  photos: string[] | null;
  agent?: { id: number; name: string; email?: string; phone?: string };
  created_at: string;
}

async function call<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const token = auth ? readSession()?.token : undefined;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = json?.errors ? Object.values<string[]>(json.errors)[0]?.[0] : undefined;
    throw new Error(first || json?.message || `Request failed (${res.status})`);
  }
  return json as T;
}

// ---- public landing page (no login) ----
export function fetchPublicListings(params: Record<string, string>) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return call<{ data: ApiListing[]; meta: { page: number; last_page: number; total: number } }>(`/public/listings?${qs}`);
}
export const fetchPublicListing = (id: string) => call<{ data: ApiListing }>(`/public/listings/${id}`);
export const sendInquiry = (id: number, body: { name: string; phone: string; message?: string }) =>
  call(`/public/listings/${id}/inquire`, { method: "POST", body: JSON.stringify(body) });

// ---- agent ----
/** Sends a new listing to the API for admin approval. Silent no-op when no API is configured. */
export async function submitListingToApi(input: NewListingInput) {
  if (!process.env.NEXT_PUBLIC_API_URL || !readSession()?.token) return;
  const kind = input.listingType ?? "rent";
  try {
    await call(
      "/agent/listings",
      {
        method: "POST",
        body: JSON.stringify({
          title: input.title,
          listing_type: kind,
          property_type: input.type,
          zone: input.zone,
          address: input.address,
          beds: input.beds,
          baths: input.baths,
          price: input.rentPerYear,
          price_period: kind === "rent" ? "per_year" : null,
        }),
      },
      true
    );
  } catch (e) {
    console.error("Listing could not be sent to the server", e);
  }
}

// ---- admin approval queue ----
export const fetchApprovalQueue = (status: string) =>
  call<{ data: ApiListing[]; counts: Record<"pending" | "approved" | "rejected", number> }>(`/admin/listings?status=${status}`, {}, true);
export const approveListing = (id: number) => call(`/admin/listings/${id}/approve`, { method: "POST" }, true);
export const rejectListing = (id: number, reason: string) =>
  call(`/admin/listings/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }, true);
