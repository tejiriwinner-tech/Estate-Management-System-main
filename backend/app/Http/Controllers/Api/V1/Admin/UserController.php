<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get aggregate statistics for the User & Staff Management screen.
     */
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $pendingApprovals = User::where('status', 'pending')->count();
        $blockedAccounts = User::whereIn('status', ['suspended', 'inactive'])->count();
        $activeStaff = User::where('status', 'active')
            ->whereIn('role', ['admin', 'super_admin', 'staff', 'manager', 'agent', 'maintenance', 'security'])
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_users' => $totalUsers,
                'pending_approval' => $pendingApprovals,
                'blocked_accounts' => $blockedAccounts,
                'active_staff' => $activeStaff,
            ],
        ]);
    }

    /**
     * Display a listing of users with search, role, and status filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Search by keyword (name, email, phone, unit_number, staff_id, job_title)
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('unit_number', 'like', "%{$search}%")
                  ->orWhere('staff_id', 'like', "%{$search}%")
                  ->orWhere('job_title', 'like', "%{$search}%");
            });
        }

        // Role Filter & Category Pills
        if ($role = $request->query('role')) {
            $roleLower = strtolower($role);
            if ($roleLower === 'all_staff' || $roleLower === 'all staff') {
                $query->whereIn('role', ['admin', 'super_admin', 'staff', 'manager', 'agent', 'maintenance', 'security']);
            } elseif ($roleLower === 'managers') {
                $query->where('role', 'manager');
            } elseif ($roleLower === 'agents') {
                $query->where('role', 'agent');
            } elseif ($roleLower === 'maintenance') {
                $query->where('role', 'maintenance');
            } elseif ($roleLower === 'residents') {
                $query->where('role', 'resident');
            } elseif ($roleLower !== 'all' && $roleLower !== 'all roles') {
                $query->where('role', $role);
            }
        }

        // Status Filter
        if ($status = $request->query('status')) {
            $query->where('status', strtolower($status));
        }

        $perPage = (int) $request->query('per_page', 10);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:30',
            'role' => ['required', Rule::in(['super_admin', 'admin', 'security', 'resident', 'staff', 'manager', 'agent', 'maintenance'])],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended', 'pending'])],
            'unit_number' => 'nullable|string|max:100',
            'moved_in_at' => 'nullable|date',
            'job_title' => 'nullable|string|max:150',
            'staff_id' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:8',
        ]);

        // Auto-generate staff ID if not provided and role is a staff role
        $staffId = $validated['staff_id'] ?? null;
        if (!$staffId && in_array($validated['role'], ['admin', 'super_admin', 'staff', 'manager', 'agent', 'maintenance', 'security'])) {
            $staffId = 'STF-' . rand(1000, 9999);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'status' => $validated['status'] ?? 'active',
            'unit_number' => $validated['unit_number'] ?? null,
            'moved_in_at' => $validated['moved_in_at'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
            'staff_id' => $staffId,
            'password' => Hash::make($validated['password'] ?? 'LincolnEstate2024!'),
            'avatar_url' => 'https://ui-avatars.com/api/?name=' . urlencode($validated['name']) . '&background=0A5C36&color=fff',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:30',
            'role' => ['sometimes', Rule::in(['super_admin', 'admin', 'security', 'resident', 'staff', 'manager', 'agent', 'maintenance'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended', 'pending'])],
            'unit_number' => 'nullable|string|max:100',
            'job_title' => 'nullable|string|max:150',
            'staff_id' => 'nullable|string|max:50',
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Approve a pending user account.
     */
    public function approve(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->status = 'active';
        if (str_starts_with((string)$user->staff_id, 'STF-PEND') || empty($user->staff_id)) {
            $user->staff_id = 'STF-' . rand(2000, 8999);
        }
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "User {$user->name} approved successfully",
            'data' => $user,
        ]);
    }

    /**
     * Reject a pending user account.
     */
    public function reject(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->status = 'inactive';
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "User {$user->name} registration rejected",
            'data' => $user,
        ]);
    }

    /**
     * Toggle active vs suspended status.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        if ($user->status === 'active') {
            $user->status = 'suspended';
        } else {
            $user->status = 'active';
        }
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "User status updated to {$user->status}",
            'data' => $user,
        ]);
    }

    /**
     * Trigger password reset link or temporary password.
     */
    public function resetPassword(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $tempPassword = 'LE-' . bin2hex(random_bytes(4));
        $user->password = Hash::make($tempPassword);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "Temporary password generated for {$user->name}",
            'temporary_password' => $tempPassword,
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully',
        ]);
    }
}
