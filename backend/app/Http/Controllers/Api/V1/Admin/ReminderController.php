<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReminderController extends Controller
{
    public function index(): JsonResponse
    {
        $reminders = Reminder::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $reminders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|max:500',
            'due_time' => 'nullable|string|max:100',
            'priority' => 'nullable|string|in:low,medium,high',
        ]);

        $reminder = Reminder::create([
            'text' => $validated['text'],
            'due_time' => $validated['due_time'] ?? now()->format('g:ia'),
            'priority' => $validated['priority'] ?? 'medium',
            'is_completed' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reminder created successfully',
            'data' => $reminder,
        ], 201);
    }

    public function toggleComplete(int $id): JsonResponse
    {
        $reminder = Reminder::findOrFail($id);
        $reminder->is_completed = !$reminder->is_completed;
        $reminder->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Reminder status toggled',
            'data' => $reminder,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $reminder = Reminder::findOrFail($id);
        $reminder->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Reminder deleted successfully',
        ]);
    }
}

