<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\Reminder;
use App\Models\EstateUpdate;

class DashboardController extends Controller
{
    /**
     * Aggregated Dashboard Payload
     */
    public function index(): JsonResponse
    {
        $metrics = $this->getMetricsData();
        $reminders = Reminder::latest()->take(5)->get();
        $latestUpdate = EstateUpdate::latest('published_at')->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'administrator' => [
                    'name' => 'Administrator',
                    'role' => 'Estate Manager',
                    'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                ],
                'system_status' => [
                    'date' => now()->format('M d, Y'),
                    'time' => now()->format('H:i A') . ' WAT',
                    'operational' => true,
                ],
                'metrics' => $metrics,
                'reminders' => $reminders,
                'latest_update' => $latestUpdate,
            ],
        ]);
    }

    /**
     * Return just the 4 summary metrics matching Figma KAN-22
     */
    public function metrics(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->getMetricsData(),
        ]);
    }

    /**
     * Return Check-In / Check-Out Dashboard payload (Task 11)
     */
    public function accessLogs(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    ['id' => 'total-checkins', 'label' => 'TOTAL CHECK-INS', 'value' => '245', 'icon_type' => 'checkin'],
                    ['id' => 'total-checkouts', 'label' => 'TOTAL CHECK-OUTS', 'value' => '180', 'icon_type' => 'checkout'],
                    ['id' => 'residents-inside', 'label' => 'RESIDENTS INSIDE', 'value' => '1,240', 'icon_type' => 'residents'],
                    ['id' => 'visitors-inside', 'label' => 'VISITORS INSIDE', 'value' => '45', 'icon_type' => 'visitors'],
                ],
                'access_logs' => [
                    ['id' => 1, 'name' => 'Sarah Jenkins', 'person_type' => 'Resident', 'house_no' => 'Villa B-12', 'check_in' => '08:45 AM', 'check_out' => '-', 'gate' => 'Main Gate', 'status' => 'in_estate'],
                    ['id' => 2, 'name' => 'Mark Davis', 'person_type' => 'Visitor (Food Delivery)', 'initials' => 'MD', 'house_no' => 'Apt 402', 'check_in' => '09:12 AM', 'check_out' => '09:35 AM', 'gate' => 'Service Gate', 'status' => 'checked_out'],
                    ['id' => 3, 'name' => 'Robert Chen', 'person_type' => 'Resident', 'house_no' => 'Townhouse 7', 'check_in' => '07:30 AM', 'check_out' => '10:15 AM', 'gate' => 'Main Gate', 'status' => 'checked_out'],
                    ['id' => 4, 'name' => 'Emma Watson', 'person_type' => 'Visitor (Guest)', 'initials' => 'EW', 'house_no' => 'Villa B-12', 'check_in' => '10:45 AM', 'check_out' => '-', 'gate' => 'Main Gate', 'status' => 'in_estate'],
                    ['id' => 5, 'name' => 'David Lee', 'person_type' => 'Resident', 'house_no' => 'Apt 105', 'check_in' => '11:20 AM', 'check_out' => '-', 'gate' => 'East Gate', 'status' => 'in_estate'],
                ],
                'security_summary' => [
                    'vehicles_entered' => 185,
                    'vehicles_trend' => '↑ 12%',
                    'pedestrians' => 60,
                    'pedestrians_trend' => '↓ 3%',
                    'alert_title' => 'ALERTS',
                    'alert_description' => '2 Unregistered vehicles attempted entry at Service Gate.',
                ],
            ],
        ]);
    }

    private function getMetricsData(): array
    {
        return [
            [
                'id' => 'residents',
                'label' => 'TOTAL RESIDENTS',
                'value' => '1,248',
                'trend' => '+24',
                'trend_type' => 'positive',
                'icon_type' => 'residents',
            ],
            [
                'id' => 'houses',
                'label' => 'OCCUPIED HOUSES',
                'value' => '356',
                'badge' => '94%',
                'icon_type' => 'houses',
            ],
            [
                'id' => 'revenue',
                'label' => 'MONTHLY REVENUE',
                'value' => '₦15.2M',
                'trend' => '+8.4%',
                'trend_type' => 'positive',
                'icon_type' => 'revenue',
            ],
            [
                'id' => 'requests',
                'label' => 'PENDING REQUESTS',
                'value' => '18',
                'icon_type' => 'requests',
            ],
        ];
    }
}

