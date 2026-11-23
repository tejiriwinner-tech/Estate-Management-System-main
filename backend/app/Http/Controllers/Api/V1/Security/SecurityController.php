<?php

namespace App\Http\Controllers\Api\V1\Security;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\AppNotification;
use App\Models\GuestPass;
use App\Models\BlacklistEntry;
use App\Models\EstateAlert;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SecurityController extends Controller
{
    // ---------------- emergency ----------------
    public function emergency(): JsonResponse
    {
        $open = EstateAlert::with('sender')->where('status', 'open')->latest('id')->get();
        $history = EstateAlert::with('sender')->latest('id')->limit(50)->get();

        $active = $open->values()->map(fn (EstateAlert $a, int $i) => [
            'id' => (string) $a->id,
            'variant' => $i === 0 ? 'primary' : 'secondary',
            'severity' => $a->category === 'life_threat' ? 'CRITICAL' : 'SUSPICIOUS',
            'title' => $a->category === 'life_threat' ? 'Life Under Threat' : 'Intelligence Report',
            'location' => $a->location ?: 'Location not given',
            'section' => '',
            'detail' => $a->message,
            'resident' => $a->sender?->name ?? 'Unknown',
            'timeElapsed' => $a->created_at?->diffForHumans(null, true) ?? '',
            'dispatched' => 'Not assigned',
        ]);

        $rows = $history->map(fn (EstateAlert $a) => [
            'id' => (string) $a->id,
            'date' => $a->created_at?->format('M d, Y'),
            'time' => $a->created_at?->format('h:i A'),
            'alertType' => $a->category === 'life_threat' ? 'Life Threat' : 'Intelligence',
            'resident' => $a->sender?->name ?? 'Unknown',
            'location' => $a->location ?: '-',
            'status' => $a->status === 'resolved' ? 'Resolved' : 'Pending',
        ]);

        return response()->json(['data' => [
            'active' => $active,
            'history' => $rows,
            'total' => EstateAlert::count(),
            'contacts' => config('estate.emergency_contacts', []),
        ]]);
    }

    /** Guard-filed report from the "Report an incident" panel. */
    public function reportIncident(Request $r): JsonResponse
    {
        $d = $r->validate([
            'category' => 'required|in:life_threat,intelligence',
            'message' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);
        $me = $r->user();
        $alert = EstateAlert::create($d + ['sender_id' => $me->id]);
        foreach (User::whereIn('role', ['super_admin', 'admin', 'manager', 'security'])->where('id', '!=', $me->id)->pluck('id') as $uid) {
            AppNotification::create([
                'user_id' => $uid, 'type' => 'alert', 'title' => $me->name.' sent you an alert',
                'body' => $alert->message, 'data' => ['alert_id' => $alert->id, 'category' => $alert->category],
            ]);
        }
        return response()->json(['data' => ['id' => $alert->id]], 201);
    }

    // ---------------- blacklist / watchlist ----------------
    private function entryOut(BlacklistEntry $e): array
    {
        return [
            'id' => (string) $e->id,
            'name' => $e->name,
            'entityId' => $e->entity_ref ? 'ID: '.$e->entity_ref : '',
            'entityType' => $e->entity_type,
            'reason' => $e->reason,
            'reasonDetail' => $e->details ?? '',
            'riskLevel' => $e->risk_level,
            'status' => $e->status,
            'lastAttemptedDate' => $e->last_attempt_at?->format('M d, Y') ?? '—',
            'lastAttemptedTime' => $e->last_attempt_at?->format('H:i') ?? '—',
            'lastAttemptedLocation' => $e->last_attempt_location ?? '—',
        ];
    }

    public function blacklist(): JsonResponse
    {
        $black = BlacklistEntry::where('list_type', 'blacklist')->latest('id')->get();
        $watch = BlacklistEntry::where('list_type', 'watchlist')->latest('id')->get();

        return response()->json(['data' => [
            'entries' => $black->map(fn ($e) => $this->entryOut($e))->values(),
            'watchlist' => $watch->map(fn ($e) => $this->entryOut($e))->values(),
            'stats' => [
                'totalBlacklisted' => $black->where('status', '!=', 'CLEARED')->count(),
                'highRiskAlerts' => $black->whereIn('risk_level', ['HIGH', 'EXTREME'])->where('status', '!=', 'CLEARED')->count(),
                'watchlistEntries' => $watch->count(),
                'clearedRemoved' => $black->where('status', 'CLEARED')->count(),
            ],
        ]]);
    }

    public function addEntry(Request $r): JsonResponse
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'entity_ref' => 'nullable|string|max:120',
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string|max:2000',
            'risk_level' => ['required', Rule::in(['LOW', 'MEDIUM', 'ELEVATED', 'HIGH', 'EXTREME'])],
            'list_type' => ['nullable', Rule::in(['blacklist', 'watchlist'])],
            'entity_type' => ['nullable', Rule::in(['person', 'organisation', 'network', 'vehicle'])],
            'notify_officers' => 'nullable|boolean',
        ]);
        $entry = BlacklistEntry::create([
            'name' => $d['name'], 'entity_ref' => $d['entity_ref'] ?? null, 'reason' => $d['reason'],
            'details' => $d['details'] ?? null, 'risk_level' => $d['risk_level'],
            'list_type' => $d['list_type'] ?? 'blacklist', 'entity_type' => $d['entity_type'] ?? 'person',
            'status' => ($d['list_type'] ?? 'blacklist') === 'watchlist' ? 'UNDER_OBSERVATION' : 'RESTRICTED',
            'added_by' => $r->user()->id,
        ]);

        if ($r->boolean('notify_officers')) {
            foreach (User::where('role', 'security')->where('id', '!=', $r->user()->id)->pluck('id') as $uid) {
                AppNotification::create([
                    'user_id' => $uid, 'type' => 'system', 'title' => $entry->name.' added to the '.$entry->list_type,
                    'body' => $entry->reason, 'data' => ['blacklist_id' => $entry->id],
                ]);
            }
        }
        return response()->json(['data' => $this->entryOut($entry)], 201);
    }

    public function updateEntry(Request $r, int $id): JsonResponse
    {
        $d = $r->validate([
            'status' => ['sometimes', Rule::in(['RESTRICTED', 'UNDER_OBSERVATION', 'UNDER_REVIEW', 'CLEARED'])],
            'risk_level' => ['sometimes', Rule::in(['LOW', 'MEDIUM', 'ELEVATED', 'HIGH', 'EXTREME'])],
            'last_attempt_at' => 'sometimes|nullable|date',
            'last_attempt_location' => 'sometimes|nullable|string|max:255',
        ]);
        $entry = BlacklistEntry::findOrFail($id);
        $entry->update($d);
        return response()->json(['data' => $this->entryOut($entry)]);
    }

    // ---------------- access control ----------------
    public function access(): JsonResponse
    {
        $logs = AccessLog::latest('occurred_at')->limit(50)->get();
        $row = fn (AccessLog $l) => [
            'id' => (string) $l->id,
            'name' => $l->name,
            'role' => $l->role_label ?? '',
            'gateNo' => $l->gate,
            'verificationType' => $l->verification_type,
            'status' => $l->status,
            'timestamp' => $l->occurred_at?->format('H:i:s'),
        ];

        $latestOk = AccessLog::whereIn('status', ['Authorised', 'Success'])->latest('occurred_at')->first();
        $latestDenied = AccessLog::whereIn('status', ['Denied', 'Flagged'])->latest('occurred_at')->first();

        // Entries per hour for the last 12 hours, scaled 0-100 for the bar chart.
        $start = now()->subHours(11)->startOfHour();
        $counts = array_fill(0, 12, 0);
        AccessLog::where('occurred_at', '>=', $start)->pluck('occurred_at')->each(function ($t) use (&$counts, $start) {
            $i = (int) floor($start->diffInHours($t));
            if ($i >= 0 && $i < 12) { $counts[$i]++; }
        });
        $max = max(1, max($counts));
        $bars = array_map(fn ($c) => ['height' => (int) round($c / $max * 100), 'active' => $c === $max && $c > 0], $counts);

        $passes = GuestPass::where('status', 'active')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('id')->limit(10)->get()->map(function (GuestPass $p) {
                $mins = $p->expires_at ? (int) now()->diffInMinutes($p->expires_at, false) : null;
                return [
                    'id' => (string) $p->id,
                    'name' => $p->name,
                    'subtitle' => $mins !== null ? "Expiring in {$mins}m" : ($p->invited_by ? "Invited by {$p->invited_by}" : 'One-time entry'),
                    'status' => $mins !== null && $mins <= 15 ? 'expiring' : 'cleared',
                ];
            });

        return response()->json(['data' => [
            'logs' => $logs->map($row)->values(),
            'total' => AccessLog::count(),
            'trafficBars' => $bars,
            'entriesLast12h' => array_sum($counts),
            'latestVerified' => $latestOk ? [
                'name' => $latestOk->name, 'role' => $latestOk->role_label ?? '', 'verificationType' => $latestOk->verification_type,
                'gate' => $latestOk->gate, 'time' => $latestOk->occurred_at?->format('H:i'),
            ] : null,
            'latestDenied' => $latestDenied ? [
                'name' => $latestDenied->name, 'time' => $latestDenied->occurred_at?->format('H:i'),
                'reason' => $latestDenied->failure_reason ?? $latestDenied->status, 'gate' => $latestDenied->gate,
            ] : null,
            'passes' => $passes->values(),
        ]]);
    }

    public function logAccess(Request $r): JsonResponse
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'role_label' => 'nullable|string|max:255',
            'gate' => 'required|string|max:120',
            'verification_type' => ['required', Rule::in(['Face ID', 'QR Code', 'Manual', 'Biometric'])],
            'status' => ['required', Rule::in(['Authorised', 'Success', 'Denied', 'Flagged'])],
            'failure_reason' => 'nullable|string|max:255',
            'user_id' => 'nullable|integer|exists:users,id',
            'direction' => ['nullable', Rule::in(['in', 'out'])],
            'person_type' => ['nullable', Rule::in(['Resident', 'Visitor', 'Service'])],
            'house_no' => 'nullable|string|max:60',
            'vehicle_plate' => 'nullable|string|max:20',
            'companions' => 'nullable|string|max:255',
            'occurred_at' => 'nullable|date',
        ]);
        $log = AccessLog::create(array_merge($d, ['logged_by' => $r->user()->id, 'occurred_at' => $d['occurred_at'] ?? now()]));
        return response()->json(['data' => ['id' => $log->id]], 201);
    }

    public function createPass(Request $r): JsonResponse
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'invited_by' => 'nullable|string|max:120',
            'expires_in_minutes' => 'nullable|integer|min:5|max:10080',
        ]);
        $pass = GuestPass::create([
            'name' => $d['name'], 'invited_by' => $d['invited_by'] ?? null,
            'kind' => isset($d['expires_in_minutes']) ? 'timed' : 'one_time',
            'expires_at' => isset($d['expires_in_minutes']) ? now()->addMinutes($d['expires_in_minutes']) : null,
            'created_by' => $r->user()->id,
        ]);
        return response()->json(['data' => ['id' => $pass->id]], 201);
    }
}
