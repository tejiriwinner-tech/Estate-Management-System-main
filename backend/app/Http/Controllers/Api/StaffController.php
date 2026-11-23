<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * List all staff members.
     */
    public function index(): JsonResponse
    {
        $staff = [
            [
                'id' => '1',
                'name' => 'Bessie Cooper',
                'role' => 'Senior Property Manager',
                'code' => '#LE-2940',
                'isOnline' => true,
                'email' => 'bessie.cooper@lincolnestate.ng',
                'department' => 'Operations',
            ],
            [
                'id' => '2',
                'name' => 'Darlene Robertson',
                'role' => 'Chief Financial Officer',
                'code' => '#LE-1822',
                'isOnline' => true,
                'email' => 'darlene.r@lincolnestate.ng',
                'department' => 'Finance & Accounts',
            ],
            [
                'id' => '3',
                'name' => 'Floyd Miles',
                'role' => 'Facility Maintenance Lead',
                'code' => '#LE-3410',
                'isOnline' => false,
                'email' => 'floyd.m@lincolnestate.ng',
                'department' => 'Maintenance',
            ],
            [
                'id' => '4',
                'name' => 'Eleanor Pena',
                'role' => 'Billing & Collections Officer',
                'code' => '#LE-4491',
                'isOnline' => true,
                'email' => 'eleanor.p@lincolnestate.ng',
                'department' => 'Finance & Accounts',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $staff,
        ]);
    }

    /**
     * Delete a staff member (Task 2).
     */
    public function destroy(string $id): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => "Staff member #{$id} has been deleted successfully.",
        ]);
    }
}
