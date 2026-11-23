<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessController extends Controller
{
    private function window(string $range): array
    {
        return match ($range) {
            'yesterday' => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
            'week' => [now()->startOfWeek(), now()->endOfDay()],
            default => [now()->startOfDay(), now()->endOfDay()],
        };
    }

    private function initials(string $name): string
    {
        return strtoupper(collect(preg_split('/\s+/', trim($name)))->filter()->map(fn ($p) => mb_substr($p, 0, 1))->take(2)->implode(''));
    }

    public function index(Request $r): JsonResponse
    {
        [$from, $to] = $this->window((string) $r->query('range', 'today'));
        $events = AccessLog::whereBetween('occurred_at', [$from, $to])->whereIn('status', ['Authorised', 'Success'])
            ->orderBy('occurred_at')->get();

        $ins = $events->where('direction', 'in');
        $outs = $events->where('direction', 'out');

        // Pair each check-in with the next check-out for the same person.
        $visits = $ins->map(function (AccessLog $in) use ($outs) {
            $out = $outs->first(fn (AccessLog $o) => $o->name === $in->name && $o->occurred_at >= $in->occurred_at);
            return [
                'id' => $in->id,
                'name' => $in->name,
                'person_type' => $in->role_label ?: $in->person_type,
                'initials' => $this->initials($in->name),
                'house_no' => $in->house_no ?? '-',
                'check_in' => $in->occurred_at?->format('h:i A'),
                'check_out' => $out?->occurred_at?->format('h:i A') ?? '-',
                'gate' => $in->gate,
                'status' => $out ? 'checked_out' : 'in_estate',
            ];
        })->sortByDesc('id')->values();

        // "Inside" = latest event for that person (all time, today onwards) is a check-in.
        $latest = AccessLog::whereIn('status', ['Authorised', 'Success'])->where('occurred_at', '>=', now()->startOfDay())
            ->orderBy('occurred_at')->get()->groupBy('name')->map->last();
        $inside = $latest->where('direction', 'in');

        $metrics = [
            ['id' => 'total-checkins', 'label' => 'TOTAL CHECK-INS', 'value' => (string) $ins->count(), 'iconType' => 'checkin'],
            ['id' => 'total-checkouts', 'label' => 'TOTAL CHECK-OUTS', 'value' => (string) $outs->count(), 'iconType' => 'checkout'],
            ['id' => 'residents-inside', 'label' => 'RESIDENTS INSIDE', 'value' => (string) $inside->where('person_type', 'Resident')->count(), 'iconType' => 'residents'],
            ['id' => 'visitors-inside', 'label' => 'VISITORS INSIDE', 'value' => (string) $inside->where('person_type', '!=', 'Resident')->count(), 'iconType' => 'visitors'],
        ];

        $incidentsQ = AccessLog::whereBetween('occurred_at', [$from, $to])->whereIn('status', ['Denied', 'Flagged'])->latest('occurred_at');
        $incidents = (clone $incidentsQ)->limit(5)->get();
        $latestIncident = $incidents->first();
        $guards = User::where('role', 'security')->where('status', 'active')->orderBy('name')->get();

        $summary = [
            'vehicles_entered' => $ins->whereNotNull('vehicle_plate')->count(),
            'pedestrians' => $ins->whereNull('vehicle_plate')->count(),
            'alert_title' => $latestIncident ? ($latestIncident->failure_reason ?: $latestIncident->status) : 'No incidents',
            'alert_description' => $latestIncident ? "{$latestIncident->name} at {$latestIncident->gate}." : 'No denied or flagged entries in this period.',
            'incidents' => $incidents->map(fn ($i) => [
                'id' => $i->id, 'time' => $i->occurred_at?->format('h:i A'), 'gate' => $i->gate,
                'plate' => $i->vehicle_plate ?? '-', 'description' => $i->failure_reason ?: $i->status, 'resolved' => false,
            ])->values(),
            'active_personnel' => $guards->take(3)->map(fn ($g) => [
                'id' => $g->id, 'name' => $g->name, 'role' => $g->job_title ?: 'Security', 'avatar_url' => $g->avatar_url,
            ])->values(),
            'extra_personnel_count' => max(0, $guards->count() - 3),
        ];

        $mobile = $events->sortByDesc('occurred_at')->values()->map(fn (AccessLog $e) => [
            'id' => $e->id,
            'initials' => $this->initials($e->name),
            'name' => $e->name,
            'unit_label' => $e->house_no ? ($e->person_type === 'Resident' ? 'Unit '.$e->house_no : 'Visiting: Unit '.$e->house_no) : ($e->role_label ?? ''),
            'badge_type' => $e->person_type,
            'action_type' => $e->direction === 'out' ? 'Check-out' : 'Check-in',
            'time' => $e->occurred_at?->format('h:i A'),
            'gate' => $e->gate,
            'vehicle' => $e->vehicle_plate ?: 'Walk-in',
        ]);

        return response()->json(['data' => [
            'metrics' => $metrics,
            'logs' => $visits,
            'summary' => $summary,
            'mobileLogs' => $mobile,
        ]]);
    }
}
