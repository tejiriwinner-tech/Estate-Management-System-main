<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\GateScanner;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    private function initials(string $n): string
    {
        return strtoupper(collect(preg_split('/\s+/', trim($n)))->filter()->map(fn ($p) => mb_substr($p, 0, 1))->take(2)->implode(''));
    }

    public function index(): JsonResponse
    {
        $vehicles = Vehicle::latest('id')->get();
        $scanners = GateScanner::orderBy('id')->get();
        $online = $scanners->filter->isOnline()->count();

        $records = $vehicles->map(fn (Vehicle $v) => [
            'id' => $v->id, 'initials' => $this->initials($v->owner_name), 'owner_name' => $v->owner_name,
            'owner_role' => $v->owner_role, 'house_unit' => $v->house_unit ?? '-', 'vehicle_type' => $v->vehicle_type,
            'plate_number' => $v->plate_number, 'status' => $v->status,
        ])->values();

        $feeds = $scanners->map(fn (GateScanner $s) => [
            'id' => (string) $s->id, 'name' => $s->name, 'ip_address' => $s->ip_address ?? '-',
            'status' => $s->isOnline() ? 'online' : 'offline',
            'offline_label' => $s->enabled ? 'OFFLINE - Check Conn.' : 'DISABLED',
            'last_ping' => $s->last_ping_at ? 'Last ping: '.$s->last_ping_at->diffForHumans() : 'Never reported',
            'online' => $s->isOnline(),
        ])->values();

        $entriesToday = AccessLog::where('direction', 'in')->whereNotNull('vehicle_plate')->where('occurred_at', '>=', now()->startOfDay())->count();

        return response()->json(['data' => [
            'metrics' => [
                ['id' => 'registered', 'label' => 'Registered Vehicles', 'value' => $vehicles->where('status', 'active')->count(), 'iconType' => 'registered'],
                ['id' => 'visitor', 'label' => 'Visitor Vehicles', 'value' => $vehicles->where('owner_role', 'Visitor')->count(), 'iconType' => 'visitor'],
                ['id' => 'pending', 'label' => 'Pending Verification', 'value' => $vehicles->where('status', 'pending')->count(), 'iconType' => 'pending'],
                ['id' => 'disabled', 'label' => 'Disabled Passes', 'value' => $vehicles->where('status', 'disabled')->count(), 'iconType' => 'disabled'],
            ],
            'vehicles' => $records,
            'scanners' => $feeds,
            'mobileMetrics' => [
                ['id' => 'm-total-reg', 'label' => 'Total Registered', 'value' => (string) $vehicles->count(), 'iconType' => 'car'],
                ['id' => 'm-scanners', 'label' => 'Active Scanners', 'value' => $online.' / '.$scanners->count(), 'iconType' => 'scan'],
                ['id' => 'm-entries', 'label' => 'Entries Today', 'value' => (string) $entriesToday, 'iconType' => 'entry'],
            ],
            'mobileDirectory' => $vehicles->map(fn (Vehicle $v) => [
                'id' => $v->id, 'plate' => $v->plate_number, 'make_color' => $v->vehicle_type,
                'badge' => $v->owner_role === 'Resident' ? 'RESIDENT' : 'VISITOR',
                'owner_display' => $v->owner_name,
                'sub_info' => $v->valid_until ? 'Valid till '.$v->valid_until->format('M d') : ($v->house_unit ?? '-'),
                'sub_icon' => $v->valid_until ? 'clock' : 'home',
            ])->values(),
        ]]);
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate([
            'owner_name' => 'required|string|max:255',
            'owner_role' => ['required', Rule::in(['Resident', 'Vendor', 'Visitor'])],
            'house_unit' => 'nullable|string|max:100',
            'vehicle_type' => 'required|string|max:150',
            'plate_number' => 'required|string|max:30|unique:vehicles,plate_number',
            'status' => ['nullable', Rule::in(['active', 'pending', 'disabled'])],
            'valid_until' => 'nullable|date',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);
        $v = Vehicle::create($d + ['status' => $d['status'] ?? 'active']);
        return response()->json(['data' => ['id' => $v->id]], 201);
    }

    public function update(Request $r, int $id): JsonResponse
    {
        $d = $r->validate([
            'status' => ['sometimes', Rule::in(['active', 'pending', 'disabled'])],
            'owner_role' => ['sometimes', Rule::in(['Resident', 'Vendor', 'Visitor'])],
        ]);
        Vehicle::findOrFail($id)->update($d);
        return response()->json(['data' => ['ok' => true]]);
    }

    public function destroy(int $id): JsonResponse
    {
        Vehicle::findOrFail($id)->delete();
        return response()->json(['data' => ['ok' => true]]);
    }

    // ---- scanners ----
    public function storeScanner(Request $r): JsonResponse
    {
        $d = $r->validate(['name' => 'required|string|max:120', 'ip_address' => 'nullable|string|max:60']);
        $s = GateScanner::create($d);
        return response()->json(['data' => ['id' => $s->id]], 201);
    }

    public function updateScanner(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['enabled' => 'required|boolean']);
        GateScanner::findOrFail($id)->update($d);
        return response()->json(['data' => ['ok' => true]]);
    }

    /** Called by the scanner device (or its gateway) to report it is alive. */
    public function pingScanner(int $id): JsonResponse
    {
        GateScanner::findOrFail($id)->update(['last_ping_at' => now()]);
        return response()->json(['data' => ['ok' => true]]);
    }
}
