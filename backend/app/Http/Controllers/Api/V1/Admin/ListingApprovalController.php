<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** KAN-66: admin approval queue. Nothing reaches the landing page without passing through here. */
class ListingApprovalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');
        $q = Listing::with('agent:id,name,email,phone')->latest();
        if ($status !== 'all') {
            $q->where('approval_status', $status);
        }

        return response()->json([
            'status' => 'success',
            'data' => $q->get(),
            'counts' => [
                'pending' => Listing::where('approval_status', 'pending')->count(),
                'approved' => Listing::where('approval_status', 'approved')->count(),
                'rejected' => Listing::where('approval_status', 'rejected')->count(),
            ],
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);
        $listing->forceFill([
            'approval_status' => 'approved',
            'rejection_reason' => null,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'approved_at' => now(),
        ])->save();

        return response()->json(['status' => 'success', 'message' => 'Listing approved and now public', 'data' => $listing]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => 'required|string|min:5|max:500']);
        $listing = Listing::findOrFail($id);
        $listing->forceFill([
            'approval_status' => 'rejected',
            'rejection_reason' => $data['reason'],
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'approved_at' => null,
        ])->save();

        return response()->json(['status' => 'success', 'message' => 'Listing rejected', 'data' => $listing]);
    }
}
