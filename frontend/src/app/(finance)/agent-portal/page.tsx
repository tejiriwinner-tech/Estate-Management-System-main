"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { usePortalAgent } from "@/components/agent-portal/AgentPortalShell";
import { PortalKpiCards } from "@/components/agent-portal/PortalKpiCards";
import { ListingsSection } from "@/components/agent-portal/ListingsSection";
import { ClientRequestsSection } from "@/components/agent-portal/ClientRequestsSection";
import { ViewingsSection } from "@/components/agent-portal/ViewingsSection";
import { EarningsSection } from "@/components/agent-portal/EarningsSection";
import { AddListingModal } from "@/components/agent-portal/AddListingModal";
import { MatchesModal } from "@/components/agent-portal/MatchesModal";
import { AgentToast } from "@/components/agents/AgentToast";
import { agentsFetch } from "@/lib/agents/api";
import { formatNaira, todayIso } from "@/components/agent-portal/portalUtils";
import { isoDaysFromToday } from "@/lib/dates";
import {
  COMMISSION_RATE,
  ClientRequest,
  EarningsPoint,
  Listing,
  ListingStatus,
  NewListingInput,
  PortalViewing,
} from "@/types/agentPortal";

interface PortalData {
  agent?: { name: string; zone: string };
  listings: Listing[];
  requests: ClientRequest[];
  viewings: PortalViewing[];
  earnings: EarningsPoint[];
  /** Listings whose commission has already been paid, so it is never paid twice. */
  paidListingIds: string[];
}

const EMPTY_DATA: PortalData = { listings: [], requests: [], viewings: [], earnings: [], paidListingIds: [] };

const AVAILABILITY: Record<ListingStatus, string> = { Available: "available", "Under Offer": "under_offer", Rented: "rented" };

export default function AgentPortalPage() {
  const agent = usePortalAgent();

  const [data, setData] = useState<PortalData>(EMPTY_DATA);
  const [loadError, setLoadError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setData((await agentsFetch<{ data: PortalData }>("/agent/portal")).data);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load your portal.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const fail = (e: unknown, fallback: string) => setToast(e instanceof Error ? e.message : fallback);
  const { listings, requests, viewings, earnings } = data;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [matchRequestId, setMatchRequestId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Greeting is computed after mount so server and browser time zones can't disagree
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const closeAdd = useCallback(() => setIsAddOpen(false), []);
  const closeMatches = useCallback(() => setMatchRequestId(null), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const kpis = useMemo(() => {
    const today = todayIso();
    const weekEnd = isoDaysFromToday(7);
    return {
      activeListings: listings.filter((l) => l.status === "Available").length,
      newRequests: requests.filter((r) => r.status === "New").length,
      viewingsThisWeek: viewings.filter((v) => v.status === "Scheduled" && v.date >= today && v.date <= weekEnd).length,
      earnedThisMonth: earnings[earnings.length - 1]?.commission ?? 0,
      pendingCommission: listings
        .filter((l) => l.status === "Under Offer")
        .reduce((s, l) => s + Math.round(l.rentPerYear * COMMISSION_RATE), 0),
    };
  }, [listings, requests, viewings, earnings]);

  const matchRequest = requests.find((r) => r.id === matchRequestId) ?? null;

  const handleCreateListing = async (input: NewListingInput) => {
    const kind = input.listingType ?? "rent";
    try {
      await agentsFetch("/agent/listings", {
        method: "POST",
        body: JSON.stringify({
          title: input.title, listing_type: kind, property_type: input.type, zone: input.zone, address: input.address,
          beds: input.beds, baths: input.baths, price: input.rentPerYear, price_period: kind === "rent" ? "per_year" : null,
        }),
      });
      setIsAddOpen(false);
      setToast(`“${input.title}” was sent to the admin for approval. It goes public once approved.`);
      await load();
    } catch (e) {
      fail(e, "Could not save the listing.");
    }
  };

  const handleListingStatus = async (listingId: string, status: ListingStatus) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing || listing.status === status) return;
    try {
      const res = await agentsFetch<{ commission: number | null }>(`/agent/listings/${listingId}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ availability: AVAILABILITY[status] }),
      });
      if (status !== "Rented") setToast(`${listing.title} is now ${status}.`);
      else if (res.commission) setToast(`${listing.title} is rented. You earned ${formatNaira(res.commission)} commission.`);
      else setToast(`${listing.title} is rented. No new commission (already paid, or not a rental).`);
      await load();
    } catch (e) {
      fail(e, "Could not update the listing.");
    }
  };

  const handleMarkContacted = async (requestId: string) => {
    const r = requests.find((x) => x.id === requestId);
    try {
      await agentsFetch(`/agent/requests/${requestId}`, { method: "PATCH", body: JSON.stringify({ status: "Contacted" }) });
      if (r) setToast(`${r.clientName} marked as contacted.`);
      await load();
    } catch (e) {
      fail(e, "Could not update the request.");
    }
  };

  /** Returns an error message when the viewing can't be booked, otherwise null. */
  const handleBook = async ({ request, listing, date, time }: { request: ClientRequest; listing: Listing; date: string; time: string }): Promise<string | null> => {
    try {
      await agentsFetch("/agent/viewings", {
        method: "POST",
        body: JSON.stringify({ listing_id: Number(listing.id), client_request_id: Number(request.id), client_name: request.clientName, date, time }),
      });
      setMatchRequestId(null);
      setToast(`Viewing booked for ${request.clientName} at ${listing.title}.`);
      await load();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Could not book the viewing.";
    }
  };

  const handleViewing = async (viewingId: string, status: "Completed" | "Cancelled") => {
    const v = viewings.find((x) => x.id === viewingId);
    if (!v) return;
    try {
      await agentsFetch(`/agent/viewings/${viewingId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setToast(`Viewing with ${v.clientName} ${status === "Completed" ? "marked as done" : "cancelled"}.`);
      await load();
    } catch (e) {
      fail(e, "Could not update the viewing.");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{loadError}</div>}
        {/* Greeting */}
        <div id="overview" className="flex scroll-mt-28 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-dark sm:text-2xl">
              {greeting}, {(data.agent?.name ?? agent.name).split(' ')[0]}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Here&apos;s what&apos;s happening with your rentals today.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </button>
        </div>

        <PortalKpiCards values={kpis} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <ListingsSection listings={listings} onStatusChange={handleListingStatus} onAdd={() => setIsAddOpen(true)} />
            <ClientRequestsSection
              requests={requests}
              listings={listings}
              onFindMatches={(r) => setMatchRequestId(r.id)}
              onMarkContacted={handleMarkContacted}
            />
          </div>
          <div className="space-y-6 xl:col-span-4">
            <ViewingsSection
              viewings={viewings}
              listings={listings}
              onComplete={(id) => handleViewing(id, "Completed")}
              onCancel={(id) => handleViewing(id, "Cancelled")}
            />
            <EarningsSection earnings={earnings} listings={listings} />
          </div>
        </div>

      </div>

      {/* Overlays sit outside the space-y container so they get no stray top margin */}
      <AddListingModal isOpen={isAddOpen} onClose={closeAdd} onCreate={handleCreateListing} />
      <MatchesModal request={matchRequest} listings={listings} onClose={closeMatches} onBook={handleBook} />
      <AgentToast message={toast} onDismiss={dismissToast} />
    </>
  );
}
