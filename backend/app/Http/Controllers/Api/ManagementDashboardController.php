<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ManagementDashboardController extends Controller
{
    /**
     * Get system overview metrics for the Management Dashboard.
     */
    public function overview(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'totalResidents' => 1248,
                'activeUsers' => 1102,
                'pendingApprovals' => 24,
                'activeBlacklist' => 7,
                'quickAccess' => [
                    ['id' => 'user-approve', 'label' => 'User Approve', 'route' => '/staffs'],
                    ['id' => 'reports', 'label' => 'Reports', 'route' => '/reports'],
                    ['id' => 'finance', 'label' => 'Finance', 'route' => '/finance'],
                    ['id' => 'blacklist', 'label' => 'Blacklist', 'route' => '/blacklist'],
                    ['id' => 'announcements', 'label' => 'Announcements', 'route' => '/announcements'],
                ],
            ],
        ]);
    }
}
