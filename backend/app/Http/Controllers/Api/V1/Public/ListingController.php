<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** KAN-67/68: public landing page data. Only approved listings are ever returned. */
class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Listing::public()->where('availability', '!=', 'sold')->latest('approved_at');

        foreach (['listing_type', 'property_type', 'zone'] as $f) {
            if ($v = $request->query($f)) {
                $q->where($f, $v);
            }
        }
        if ($v = $request->query('beds')) {
            $q->where('beds', '>=', (int) $v);
        }
        if ($v = $request->query('min_price')) {
            $q->where('price_kobo', '>=', (int) round($v * 100));
        }
        if ($v = $request->query('max_price')) {
            $q->where('price_kobo', '<=', (int) round($v * 100));
        }
        if ($v = trim((string) $request->query('q', ''))) {
            $q->where(fn ($w) => $w->where('title', 'like', "%$v%")->orWhere('address', 'like', "%$v%")->orWhere('zone', 'like', "%$v%"));
        }

        $page = $q->with('agent:id,name')->paginate((int) min($request->query('per_page', 12), 50));

        return response()->json(['status' => 'success', 'data' => $page->items(), 'meta' => [
            'page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total(),
        ]]);
    }

    public function show(int $id): JsonResponse
    {
        $listing = Listing::public()->with('agent:id,name,phone,email')->findOrFail($id);
        $listing->increment('views');

        return response()->json(['status' => 'success', 'data' => $listing]);
    }

    public function inquire(Request $request, int $id): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:100', 'phone' => 'required|string|max:30', 'message' => 'nullable|string|max:1000']);
        $listing = Listing::public()->findOrFail($id);
        $listing->increment('inquiries');
        $req = \App\Models\ClientRequest::create([
            'agent_id' => $listing->agent_id, 'listing_id' => $listing->id, 'client_name' => $request->input('name'),
            'phone' => $request->input('phone'), 'note' => $request->input('message'), 'property_type' => $listing->property_type,
            'min_beds' => (int) $listing->beds, 'zone' => $listing->zone, 'max_budget_kobo' => $listing->price_kobo,
        ]);
        \App\Models\AppNotification::create(['user_id' => $listing->agent_id, 'type' => 'inquiry', 'title' => 'New inquiry: '.$listing->title,
            'body' => $req->client_name.' ('.$req->phone.')', 'data' => ['client_request_id' => $req->id]]);

        return response()->json(['status' => 'success', 'message' => 'The agent has been notified.']);
    }
}
