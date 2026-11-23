<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\AwayNotice;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AwayController extends Controller
{
    private function initials(string $n): string
    {
        return strtoupper(collect(preg_split('/\s+/', trim($n)))->filter()->map(fn ($p) => mb_substr($p, 0, 1))->take(2)->implode(''));
    }

    public function index(): JsonResponse
    {
        $today = now()->startOfDay();
        $notices = AwayNotice::where('status', 'away')->orderBy('expected_return_date')->get();
        $overdue = $notices->filter(fn ($n) => $n->expected_return_date->lt($today));
        $weekEnd = now()->addDays(7)->endOfDay();
        $soon = $notices->filter(fn ($n) => $n->expected_return_date->gte($today) && $n->expected_return_date->lte($weekEnd));

        $residents = $notices->map(fn ($n) => [
            'id' => $n->id,
            'initials' => $this->initials($n->resident_name),
            'resident_name' => $n->resident_name,
            'unit' => $n->unit,
            'user_id' => $n->user_id,
            'departure_date' => $n->departure_date->format('M d, Y'),
            'expected_return_date' => $n->expected_return_date->format('M d, Y'),
            'departure_iso' => $n->departure_date->toDateString(),
            'expected_return_iso' => $n->expected_return_date->toDateString(),
            'is_overdue' => $n->expected_return_date->lt($today),
            'status' => $n->expected_return_date->lt($today) ? 'check_required' : 'away',
            'emergency_contact_name' => $n->emergency_contact_name,
            'emergency_contact_phone' => $n->emergency_contact_phone,
            'notes' => $n->notes,
            'notify_security' => $n->notify_security,
            'suspend_packages' => $n->suspend_packages,
        ])->values();

        $upcoming = $soon->take(6)->map(fn ($n) => [
            'id' => $n->id,
            'month_short' => strtoupper($n->expected_return_date->format('M')),
            'day' => $n->expected_return_date->format('d'),
            'resident_name' => $n->resident_name,
            'unit' => $n->unit,
        ])->values();

        $mobile = $notices->map(function ($n) use ($soon) {
            $note = $n->emergency_contact_name
                ? 'Contact: '.$n->emergency_contact_name.($n->emergency_contact_phone ? ' ('.$n->emergency_contact_phone.')' : '')
                : ($n->notes ? 'Notes: '.$n->notes : 'Contact: N/A');
            return [
                'id' => $n->id,
                'resident_name' => $n->resident_name,
                'unit' => $n->unit,
                'status' => $soon->contains('id', $n->id) ? 'RETURNING SOON' : 'AWAY',
                'date_range' => $n->departure_date->format('M d').' - '.$n->expected_return_date->format('M d'),
                'from_date' => $n->departure_date->toDateString(),
                'to_date' => $n->expected_return_date->toDateString(),
                'footer_note' => $note,
            ];
        })->values();

        $options = User::where('role', 'resident')->whereNotNull('unit_number')->orderBy('name')->get()->map(fn ($u) => [
            'label' => $u->name.' — '.$u->unit_number,
            'resident_name' => $u->name,
            'unit' => $u->unit_number,
            'initials' => $this->initials($u->name),
            'user_id' => $u->id,
        ])->values();

        return response()->json(['data' => [
            'metrics' => [
                ['id' => 'residents-away', 'label' => 'RESIDENTS AWAY', 'value' => $notices->count(), 'iconType' => 'away'],
                ['id' => 'expected-returns', 'label' => 'EXPECTED RETURNS (7 DAYS)', 'value' => $soon->count(), 'iconType' => 'returns'],
                ['id' => 'security-alerts', 'label' => 'OVERDUE RETURNS', 'value' => $overdue->count(), 'iconType' => 'alerts'],
            ],
            'residents' => $residents,
            'upcoming' => $upcoming,
            'mobileMetrics' => [
                ['id' => 'currently-away', 'label' => 'CURRENTLY AWAY', 'value' => $notices->count(), 'iconType' => 'currently_away'],
                ['id' => 'returning-this-week', 'label' => 'RETURNING THIS WEEK', 'value' => $soon->count(), 'iconType' => 'returning_week'],
            ],
            'mobileLogs' => $mobile,
            'options' => $options,
        ]]);
    }

    private function rules(): array
    {
        return [
            'user_id' => 'nullable|integer|exists:users,id',
            'resident_name' => 'required|string|max:255',
            'unit' => 'required|string|max:100',
            'departure_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:departure_date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:40',
            'notes' => 'nullable|string|max:255',
            'notify_security' => 'nullable|boolean',
            'suspend_packages' => 'nullable|boolean',
        ];
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate($this->rules());
        $notice = AwayNotice::create($d + ['created_by' => $r->user()?->id, 'status' => 'away']);

        if ($notice->notify_security) {
            foreach (User::where('role', 'security')->pluck('id') as $uid) {
                AppNotification::create([
                    'user_id' => $uid, 'type' => 'system',
                    'title' => $notice->resident_name.' is away ('.$notice->unit.')',
                    'body' => 'Back on '.$notice->expected_return_date->format('M d, Y'),
                    'data' => ['away_id' => $notice->id],
                ]);
            }
        }
        return response()->json(['data' => ['id' => $notice->id]], 201);
    }

    public function update(Request $r, int $id): JsonResponse
    {
        $notice = AwayNotice::findOrFail($id);
        $notice->update($r->validate($this->rules()));
        return response()->json(['data' => ['id' => $notice->id]]);
    }

    public function markReturned(int $id): JsonResponse
    {
        AwayNotice::findOrFail($id)->update(['status' => 'returned']);
        return response()->json(['data' => ['ok' => true]]);
    }
}
