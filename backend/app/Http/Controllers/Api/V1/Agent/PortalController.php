<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\ClientRequest;
use App\Models\CommissionPayout;
use App\Models\Listing;
use App\Models\Viewing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The individual agent's portal: listings, client requests, viewings and earnings.
 * Response shapes match the front-end `agentPortal` types (money in naira).
 */
class PortalController extends Controller
{
    public const COMMISSION_RATE = 0.10; // share of the first year's rent

    private const AVAIL = ['available' => 'Available', 'under_offer' => 'Under Offer', 'rented' => 'Rented', 'sold' => 'Rented'];

    public static function listingOut(Listing $l): array
    {
        return [
            'id' => (string) $l->id, 'title' => $l->title, 'type' => $l->property_type, 'zone' => $l->zone, 'address' => $l->address,
            'beds' => (int) $l->beds, 'baths' => (int) $l->baths, 'rentPerYear' => $l->price_kobo / 100,
            'status' => self::AVAIL[$l->availability] ?? 'Available', 'listedOn' => $l->created_at->toDateString(),
            'views' => (int) $l->views, 'inquiries' => (int) $l->inquiries, 'approval' => $l->approval_status, 'listingType' => $l->listing_type,
        ];
    }

    private function requestOut(ClientRequest $r): array
    {
        return [
            'id' => (string) $r->id, 'clientName' => $r->client_name, 'phone' => $r->phone, 'email' => $r->email ?? '',
            'propertyType' => $r->property_type, 'minBeds' => (int) $r->min_beds, 'zone' => $r->zone,
            'maxBudget' => $r->max_budget_kobo / 100, 'moveInBy' => $r->move_in_by?->toDateString() ?? '', 'note' => $r->note ?? '',
            'status' => $r->status, 'receivedOn' => $r->created_at->toDateString(),
        ];
    }

    private function viewingOut(Viewing $v): array
    {
        return [
            'id' => (string) $v->id, 'listingId' => (string) $v->listing_id, 'requestId' => $v->client_request_id ? (string) $v->client_request_id : null,
            'clientName' => $v->client_name, 'date' => $v->scheduled_at->toDateString(), 'time' => $v->scheduled_at->format('H:i'), 'status' => $v->status,
        ];
    }

    public function show(Request $r): JsonResponse
    {
        $uid = $r->user()->id;
        $payouts = CommissionPayout::where('agent_id', $uid)->get();
        $earnings = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonths($i);
            $earnings[] = ['month' => $m->format('M'), 'commission' => (int) round($payouts->filter(fn ($p) => $p->paid_at->isSameMonth($m))->sum('amount_kobo') / 100)];
        }

        return response()->json(['data' => [
            'agent' => ['name' => $r->user()->name, 'zone' => \App\Models\AgentProfile::where('user_id', $uid)->value('zone') ?? ''],
            'listings' => Listing::where('agent_id', $uid)->latest()->get()->map(fn ($l) => self::listingOut($l))->values(),
            'requests' => ClientRequest::where(fn ($q) => $q->where('agent_id', $uid)->orWhereNull('agent_id'))->latest()->limit(100)->get()->map(fn ($x) => $this->requestOut($x))->values(),
            'viewings' => Viewing::where('agent_id', $uid)->orderBy('scheduled_at')->limit(200)->get()->map(fn ($v) => $this->viewingOut($v))->values(),
            'earnings' => $earnings,
            'paidListingIds' => $payouts->pluck('listing_id')->map(fn ($i) => (string) $i)->values(),
        ]]);
    }

    public function updateRequest(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['status' => ['required', Rule::in(ClientRequest::STATUSES)]]);
        $req = ClientRequest::where(fn ($q) => $q->where('agent_id', $r->user()->id)->orWhereNull('agent_id'))->findOrFail($id);
        $req->update(['status' => $d['status'], 'agent_id' => $req->agent_id ?? $r->user()->id]);

        return response()->json(['data' => $this->requestOut($req)]);
    }

    public function bookViewing(Request $r): JsonResponse
    {
        $d = $r->validate([
            'listing_id' => 'required|integer', 'client_request_id' => 'nullable|integer|exists:client_requests,id',
            'client_name' => 'required|string|max:255', 'date' => 'required|date_format:Y-m-d', 'time' => 'required|date_format:H:i',
        ]);
        $uid = $r->user()->id;
        $listing = Listing::where('agent_id', $uid)->findOrFail($d['listing_id']);
        $at = \Illuminate\Support\Carbon::parse($d['date'].' '.$d['time']);

        if ($at->isPast()) {
            return response()->json(['message' => 'That time has already passed. Pick a later time.'], 422);
        }
        if ($clash = Viewing::where('agent_id', $uid)->where('status', 'Scheduled')->where('scheduled_at', $at)->first()) {
            return response()->json(['message' => "You already have a viewing with {$clash->client_name} at that time."], 422);
        }

        $v = Viewing::create(['listing_id' => $listing->id, 'client_request_id' => $d['client_request_id'] ?? null, 'agent_id' => $uid,
            'client_name' => $d['client_name'], 'scheduled_at' => $at]);
        if (! empty($d['client_request_id'])) {
            ClientRequest::whereKey($d['client_request_id'])->update(['status' => 'Viewing Booked', 'agent_id' => $uid]);
        }

        return response()->json(['data' => $this->viewingOut($v)], 201);
    }

    public function updateViewing(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['status' => ['required', Rule::in(['Completed', 'Cancelled'])]]);
        $v = Viewing::where('agent_id', $r->user()->id)->findOrFail($id);
        $v->update(['status' => $d['status']]);
        $this->settleRequest($v->client_request_id);

        return response()->json(['data' => $this->viewingOut($v)]);
    }

    /** A request with no scheduled viewings left drops back from "Viewing Booked" to "Contacted". */
    public static function settleRequest(?int $requestId): void
    {
        if (! $requestId) return;
        $req = ClientRequest::find($requestId);
        if ($req && $req->status === 'Viewing Booked' && ! Viewing::where('client_request_id', $requestId)->where('status', 'Scheduled')->exists()) {
            $req->update(['status' => 'Contacted']);
        }
    }

    /** Called when a listing is marked rented/sold: pay commission once, cancel stale viewings. */
    public static function onRented(Listing $l): ?int
    {
        $stale = Viewing::where('listing_id', $l->id)->where('status', 'Scheduled')->get();
        foreach ($stale as $v) {
            $v->update(['status' => 'Cancelled']);
            self::settleRequest($v->client_request_id);
        }
        if ($l->listing_type !== 'rent' || CommissionPayout::where('listing_id', $l->id)->exists()) {
            return null;
        }
        $fee = (int) round($l->price_kobo * self::COMMISSION_RATE);
        CommissionPayout::create(['agent_id' => $l->agent_id, 'listing_id' => $l->id, 'amount_kobo' => $fee, 'paid_at' => now()]);

        return $fee;
    }
}
