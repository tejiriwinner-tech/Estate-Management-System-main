<?php

namespace App\Http\Controllers\Api\V1\Security;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\BlacklistEntry;
use App\Models\EstateAlert;
use App\Models\EstateUpdate;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Read models for the security dashboard, intelligence, reports, members and HQ screens.
 */
class OverviewController extends Controller
{
    private function ago($t): string
    {
        return $t ? $t->diffForHumans(null, true, true).' ago' : '';
    }

    private function alertRow(EstateAlert $a): array
    {
        return [
            'id' => (string) $a->id,
            'name' => $a->sender?->name ?? 'Unknown',
            'houseNumber' => $a->location ?: ($a->sender?->unit_number ?? '-'),
            'date' => $a->created_at->format('d-m-Y'),
            'report' => $a->message,
        ];
    }

    public function dashboard(Request $r): JsonResponse
    {
        $intel = EstateAlert::where('category', 'intelligence')->count();
        $threat = EstateAlert::where('category', 'life_threat')->count();
        $openThreat = EstateAlert::where('category', 'life_threat')->where('status', 'open')->count();
        $update = EstateUpdate::latest('published_at')->first();

        return response()->json(['data' => [
            'stats' => ['intelligence' => $intel, 'threats' => $threat, 'activities' => AccessLog::whereDate('occurred_at', today())->count()],
            'openThreats' => $openThreat,
            'reminders' => Reminder::where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', $r->user()->id))
                ->where('is_completed', false)->orderBy('id')->get()->map(fn ($m) => [
                    'id' => (string) $m->id, 'text' => $m->text, 'time' => $m->due_time ?? '', 'priority' => $m->priority ?: 'low',
                ])->values(),
            'update' => $update ? [
                'author' => $update->author_name, 'role' => $update->author_role,
                'timestamp' => $update->published_at?->format('M d, g:i A'),
                'body' => trim($update->lead_paragraph.' '.$update->body_paragraph),
                'imageUrl' => $update->image_url,
            ] : null,
        ]]);
    }

    public function storeReminder(Request $r): JsonResponse
    {
        $d = $r->validate(['text' => 'required|string|max:255', 'due_time' => 'nullable|string|max:20', 'priority' => ['nullable', Rule::in(['high', 'medium', 'low'])]]);
        $m = Reminder::create($d + ['user_id' => $r->user()->id, 'is_completed' => false]);
        return response()->json(['data' => ['id' => (string) $m->id, 'text' => $m->text, 'time' => $m->due_time ?? '', 'priority' => $m->priority ?: 'low']], 201);
    }

    public function intelligence(): JsonResponse
    {
        $alerts = EstateAlert::with('sender')->where('category', 'intelligence')->latest()->limit(50)->get();
        $items = $alerts->map(fn ($a) => [
            'id' => (string) $a->id,
            'status' => $a->status === 'resolved' ? 'RESOLVED' : 'URGENT',
            'category' => 'SUSPICIOUS_ACTIVITY',
            'timeAgo' => $this->ago($a->created_at),
            'title' => mb_strimwidth($a->message, 0, 60, '…'),
            'snippet' => $a->message,
            'location' => $a->location ?: ($a->sender?->unit_number ?? '-'),
        ])->values();

        return response()->json(['data' => [
            'items' => $items,
            'stats' => [
                'urgentReports' => EstateAlert::where('category', 'intelligence')->where('status', 'open')->count(),
                'resolvedToday' => EstateAlert::where('category', 'intelligence')->where('status', 'resolved')->whereDate('updated_at', today())->count(),
                'pendingReview' => EstateAlert::where('category', 'intelligence')->where('status', 'open')->count(),
            ],
        ]]);
    }

    public function reports(Request $r): JsonResponse
    {
        $cat = $r->query('category') === 'life_threat' ? 'life_threat' : 'intelligence';
        $q = EstateAlert::with('sender')->where('category', $cat);
        return response()->json(['data' => [
            'total' => (clone $q)->count(),
            'rows' => $q->latest()->limit(200)->get()->map(fn ($a) => $this->alertRow($a))->values(),
        ]]);
    }

    public function activity(): JsonResponse
    {
        $logs = AccessLog::whereNotNull('direction')->latest('occurred_at')->limit(300)->get();
        $fmt = fn ($l) => $l ? strtolower($l->occurred_at->format('g:ia')) : '—';
        $rows = $logs->groupBy(fn ($l) => $l->name.'|'.$l->occurred_at->toDateString())->map(function ($g, $key) use ($fmt) {
            $out = $g->firstWhere('direction', 'out');
            $in = $g->firstWhere('direction', 'in');
            return [
                'id' => (string) $g->first()->id, 'name' => $g->first()->name,
                'out' => $fmt($out), 'outWith' => $out?->companions ?: '—',
                'in' => $fmt($in), 'inWith' => $in?->companions ?: '—',
            ];
        })->values();

        return response()->json(['data' => ['rows' => $rows, 'total' => $rows->count()]]);
    }

    public function members(): JsonResponse
    {
        $guards = User::where('role', 'security')->orderBy('name')->get();
        return response()->json(['data' => [
            'members' => $guards->map(fn ($u) => [
                'id' => (string) $u->id, 'name' => $u->name, 'role' => $u->job_title ?: 'Security', 'email' => $u->email, 'phone' => $u->phone ?? '',
            ])->values(),
        ]]);
    }

    public function hq(): JsonResponse
    {
        $active = EstateAlert::with('sender')->where('category', 'life_threat')->where('status', 'open')->latest()->limit(10)->get();
        $watch = BlacklistEntry::latest()->limit(5)->get();
        $intel = EstateAlert::with('sender')->where('category', 'intelligence')->latest()->limit(5)->get();

        return response()->json(['data' => [
            'alerts' => $active->map(fn ($a) => [
                'id' => (string) $a->id, 'type' => 'LIFE_UNDER_THREAT',
                'resident' => ($a->sender?->name ?? 'Unknown').($a->location ? ' — '.$a->location : ''),
                'location' => $a->location ?: '-', 'detail' => $a->message, 'time' => $this->ago($a->created_at),
            ])->values(),
            'highPriorityCount' => $active->count(),
            'residents' => $watch->map(fn ($b) => [
                'id' => (string) $b->id, 'name' => $b->name ?? 'Unknown', 'tag' => $b->reason ?? 'Blacklisted',
                'status' => 'RESTRICTED',
                'lastActivity' => $b->last_attempt_at ? 'Attempted entry: '.($b->last_attempt_location ?: 'gate').' ('.$this->ago($b->last_attempt_at).')' : 'Added '.$this->ago($b->created_at),
            ])->values(),
            'intel' => $intel->map(fn ($a) => [
                'id' => (string) $a->id, 'title' => mb_strimwidth($a->message, 0, 50, '…'), 'snippet' => $a->message,
                'tags' => [['label' => $a->status === 'resolved' ? 'Resolved' : 'Open', 'variant' => $a->status === 'resolved' ? 'default' : 'investigation']],
                'time' => $this->ago($a->created_at),
            ])->values(),
        ]]);
    }
}
