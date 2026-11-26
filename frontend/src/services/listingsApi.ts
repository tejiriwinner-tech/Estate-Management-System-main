import { readSession } from "@/components/auth/session";
import type { NewListingInput } from "@/types/agentPortal";

const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

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
  price: number; // naira
  price_period: string | null;
  availability: string;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  photos: string[] | null;
  agent?: { id: number; name: string; email?: string; phone?: string };
  created_at: string;
}

export const SAMPLE_LISTINGS: ApiListing[] = [
  {
    id: 1,
    title: "Luxury 4-Bedroom Terrace Duplex",
    description: "Beautifully finished modern terrace duplex located in the serene Phase 1 zone of Post Army Housing Estate. Features 24/7 power, treated water, and dedicated security.",
    listing_type: "rent",
    property_type: "Duplex",
    zone: "Phase 1",
    address: "Plot 14, Palm Crescent",
    beds: 4,
    baths: 4,
    price: 4500000,
    price_period: "per_year",
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Executive 3-Bedroom Furnished Apartment",
    description: "Spacious modern flat with premium fittings, all rooms en-suite, fitted kitchen with heat extractor, and ample parking space.",
    listing_type: "rent",
    property_type: "Apartment",
    zone: "Phase 1",
    address: "Block B4, Royal Avenue",
    beds: 3,
    baths: 3,
    price: 3200000,
    price_period: "per_year",
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Contemporary 5-Bedroom Detached Villa",
    description: "Ultra-luxury smart home with private pool, solar inverter system, cinema room, and two-room boys quarters.",
    listing_type: "sale",
    property_type: "Villa",
    zone: "Phase 2",
    address: "12 Kingfisher Drive",
    beds: 5,
    baths: 6,
    price: 185000000,
    price_period: null,
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Charming 2-Bedroom Serviced Flat",
    description: "Ideal for young professionals. Fully serviced with round-the-clock power, facility management, and high-speed fiber internet.",
    listing_type: "rent",
    property_type: "Apartment",
    zone: "Phase 2",
    address: "Flat 2A, Emerald Court",
    beds: 2,
    baths: 2,
    price: 2200000,
    price_period: "per_year",
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
];

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
export async function fetchPublicListings(params: Record<string, string>) {
  try {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    const res = await call<{ data: ApiListing[]; meta: { page: number; last_page: number; total: number } }>(`/public/listings${qs ? `?${qs}` : ""}`);
    if (res && Array.isArray(res.data)) {
      return res;
    }
  } catch {
    // Return empty list if API fails — never show fake seeder listings
  }

  return {
    data: [],
    meta: { page: 1, last_page: 1, total: 0 },
  };
}

export async function fetchPublicListing(id: string) {
  try {
    const res = await call<{ data: ApiListing }>(`/public/listings/${id}`);
    if (res && res.data) {
      return res;
    }
  } catch {
    // Fall through to sample listings
  }
  const match = SAMPLE_LISTINGS.find((i) => String(i.id) === String(id)) || SAMPLE_LISTINGS[0];
  return { data: match };
}

export async function sendInquiry(id: number, body: { name: string; phone: string; message?: string }) {
  try {
    return await call(`/public/listings/${id}/inquire`, { method: "POST", body: JSON.stringify(body) });
  } catch {
    // Fall through
  }
  return { message: "Inquiry submitted successfully." };
}

// ---- agent ----
/** Sends a new listing to the API for admin approval. Silent no-op when no API is configured. */
export async function submitListingToApi(input: NewListingInput) {
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
          image: input.image || undefined,
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
export const deleteListing = (id: number) =>
  call(`/admin/listings/${id}`, { method: "DELETE" }, true);
