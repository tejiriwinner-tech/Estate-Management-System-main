// Agent Portal: the dashboard an individual letting agent sees after "Login as Agent".

export const PROPERTY_TYPES = [
  "Apartment",
  "Terrace",
  "Duplex",
  "Detached",
  "Self-contain",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_STATUSES = ["Available", "Under Offer", "Rented"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export interface Listing {
  id: string;
  title: string;
  type: PropertyType;
  zone: string;
  address: string;
  beds: number;
  baths: number;
  rentPerYear: number;
  status: ListingStatus;
  listedOn: string; // ISO date
  views: number;
  inquiries: number;
  /** Admin review state. Only approved listings appear on the public landing page. */
  approval?: ApprovalStatus;
  listingType?: ListingKind;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ListingKind = "rent" | "sale" | "other";

export type RequestStatus = "New" | "Contacted" | "Viewing Booked" | "Negotiation" | "Closed";

export interface ClientRequest {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  /** What the house-hunter is looking for */
  propertyType: PropertyType | "Any";
  minBeds: number;
  zone: string | "Any";
  maxBudget: number; // per year
  moveInBy: string; // ISO date
  note: string;
  status: RequestStatus;
  receivedOn: string; // ISO date
}

export type ViewingState = "Scheduled" | "Completed" | "Cancelled";

export interface PortalViewing {
  id: string;
  listingId: string;
  requestId: string | null;
  clientName: string;
  date: string; // ISO date
  time: string; // "HH:MM" 24h
  status: ViewingState;
}

export interface EarningsPoint {
  month: string;
  commission: number;
}

export interface NewListingInput {
  title: string;
  type: PropertyType;
  zone: string;
  address: string;
  beds: number;
  baths: number;
  rentPerYear: number;
  listingType?: ListingKind;
}

/** Agency fee the agent earns on a let, as a share of the first year's rent. */
export const COMMISSION_RATE = 0.1;
