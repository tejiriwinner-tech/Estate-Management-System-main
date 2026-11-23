<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\EstateUpdate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EstateUpdateController extends Controller
{
    public function index(): JsonResponse
    {
        $updates = EstateUpdate::latest('published_at')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $updates,
        ]);
    }

    public function latest(): JsonResponse
    {
        $latest = EstateUpdate::latest('published_at')->first();

        if (!$latest) {
            $latest = [
                'headline_prefix' => 'Update From ',
                'headline_highlight' => 'Estate Admin',
                'image_url' => 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&w=1200&q=80',
                'image_alt' => 'Estate Security Patrol Vehicles',
                'lead_paragraph' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'body_paragraph' => 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
                'published_at' => now()->toIso8601String(),
                'author_name' => 'Chief Security Officer',
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $latest,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'headline_prefix' => 'required|string|max:100',
            'headline_highlight' => 'required|string|max:100',
            'lead_paragraph' => 'required|string',
            'body_paragraph' => 'required|string',
            'image_url' => 'required|url',
            'author_name' => 'nullable|string|max:100',
        ]);

        $update = EstateUpdate::create([
            ...$validated,
            'published_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Estate update published successfully',
            'data' => $update,
        ], 201);
    }
}

