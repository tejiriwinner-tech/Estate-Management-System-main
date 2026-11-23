<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * KAN-63/64/65: an agent creates and manages their own listings.
 * Every create or edit of content puts the listing back to `pending` for admin review.
 */
class ListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Listing::where('agent_id', $request->user()->id)->latest();
        if ($s = $request->query('approval_status')) {
            $q->where('approval_status', $s);
        }

        return response()->json(['status' => 'success', 'data' => $q->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $listing = Listing::create($data + [
            'agent_id' => $request->user()->id,
            'price_kobo' => (int) round($request->input('price') * 100),
        ]);

        return response()->json(['status' => 'success', 'message' => 'Submitted for admin approval', 'data' => $listing], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $listing = $this->own($request, $id);
        $data = $this->validated($request, partial: true);
        if ($request->has('price')) {
            $data['price_kobo'] = (int) round($request->input('price') * 100);
        }
        $listing->fill($data);
        // Content changed: needs a fresh review before it is public again.
        $listing->approval_status = 'pending';
        $listing->rejection_reason = null;
        $listing->approved_at = null;
        $listing->save();

        return response()->json(['status' => 'success', 'message' => 'Updated, awaiting admin approval', 'data' => $listing]);
    }

    /** Mark rented / sold / under offer. Does not need re-approval. */
    public function setAvailability(Request $request, int $id): JsonResponse
    {
        $listing = $this->own($request, $id);
        $listing->availability = $request->validate([
            'availability' => ['required', Rule::in(Listing::AVAILABILITY)],
        ])['availability'];
        $listing->save();
        $fee = in_array($listing->availability, ['rented', 'sold'], true) ? PortalController::onRented($listing) : null;

        return response()->json(['status' => 'success', 'data' => $listing, 'commission' => $fee ? $fee / 100 : null]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->own($request, $id)->delete();

        return response()->json(['status' => 'success', 'message' => 'Listing removed']);
    }

    private function own(Request $request, int $id): Listing
    {
        return Listing::where('agent_id', $request->user()->id)->findOrFail($id);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes|required' : 'required';

        return $request->validate([
            'title' => "$req|string|min:5|max:150",
            'description' => 'nullable|string|max:5000',
            'listing_type' => [$partial ? 'sometimes' : 'required', Rule::in(Listing::TYPES)],
            'property_type' => "$req|string|max:50",
            'zone' => "$req|string|max:100",
            'address' => "$req|string|min:5|max:255",
            'beds' => 'nullable|integer|min:0|max:50',
            'baths' => 'nullable|integer|min:0|max:50',
            'price' => "$req|numeric|min:1",
            'price_period' => 'nullable|in:per_year,per_month',
            'photos' => 'nullable|array|max:10',
            'photos.*' => 'string|max:500',
        ]);
    }
}
