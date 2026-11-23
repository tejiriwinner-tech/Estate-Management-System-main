<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Models\ClientRequest;
use App\Models\CommissionPayout;
use App\Models\Listing;
use App\Models\User;
use App\Models\Viewing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** Admin-side agent roster, pipeline and performance, all computed from real tables. */
class AgentsController extends Controller
{
    private const STATUS_OUT = ['active' => 'Active', 'on_leave' => 'On Leave', 'inactive' => 'Inactive', 'suspended' => 'Inactive', 'pending' => 'Inactive'];
    private const STATUS_IN = ['Active' => 'active', 'On Leave' => 'on_leave', 'Inactive' => 'inactive'];
    private const COLORS = ['bg-rose-100 text-rose-700', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-cyan-100 text-cyan-700'];

    private function initials(string $n): string
    {
        return collect(preg_split('/\s+/', trim($n)))->take(2)->map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)))->join('');
    }

    public function index(): JsonResponse
    {
        $users = User::where('role', 'agent')->orderBy('created_at')->get();
        $profiles = AgentProfile::whereIn('user_id', $users->pluck('id'))->get()->keyBy('user_id');
        $listings = Listing::whereIn('agent_id', $users->pluck('id'))->get()->groupBy('agent_id');
        $requests = ClientRequest::whereIn('agent_id', $users->pluck('id'))->get()->groupBy('agent_id');
        $payouts = CommissionPayout::all()->groupBy('agent_id');
        $qStart = now()->firstOfQuarter();

        $agents = $users->values()->map(function (User $u, $i) use ($profiles, $listings, $requests, $payouts, $qStart) {
            $p = $payouts->get($u->id, collect());
            $target = (int) ($profiles[$u->id]->quarterly_target_kobo ?? 0);
            $qEarned = (int) $p->filter(fn ($x) => $x->paid_at->gte($qStart))->sum('amount_kobo');
            return [
                'id' => 'AGT-'.str_pad((string) $u->id, 3, '0', STR_PAD_LEFT),
                'name' => $u->name, 'initials' => $this->initials($u->name), 'email' => $u->email, 'phone' => $u->phone ?? '',
                'zone' => $profiles[$u->id]->zone ?? '—', 'status' => self::STATUS_OUT[$u->status] ?? 'Inactive',
                'joinedOn' => $u->created_at->toDateString(),
                'activeListings' => $listings->get($u->id, collect())->where('availability', 'available')->where('approval_status', 'approved')->count(),
                'openLeads' => $requests->get($u->id, collect())->where('status', '!=', 'Closed')->count(),
                'dealsClosed' => $p->count(), 'commission' => (int) round($p->sum('amount_kobo') / 100),
                'targetProgress' => $target > 0 ? min(100, (int) round($qEarned / $target * 100)) : 0,
                'rating' => 0, 'reviews' => 0, 'avatarBg' => self::COLORS[$i % count(self::COLORS)],
            ];
        });

        $performance = [];
        $all = CommissionPayout::all();
        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonths($i);
            $in = $all->filter(fn ($x) => $x->paid_at->isSameMonth($m));
            $performance[] = ['month' => $m->format('M'), 'dealsClosed' => $in->count(), 'commission' => (int) round($in->sum('amount_kobo') / 100)];
        }

        $stageMap = ['New' => ['New Leads', '#3b82f6'], 'Contacted' => ['Contacted', '#8b5cf6'], 'Viewing Booked' => ['Viewing Scheduled', '#f59e0b'], 'Negotiation' => ['Negotiation', '#ec4899'], 'Closed' => ['Closed Won', '#10b981']];
        $counts = ClientRequest::selectRaw('status, count(*) c')->groupBy('status')->pluck('c', 'status');
        $pipeline = collect($stageMap)->map(fn ($v, $k) => ['stage' => $v[0], 'count' => (int) ($counts[$k] ?? 0), 'color' => $v[1]])->values();

        $viewings = Viewing::with('listing')->where('status', 'Scheduled')->where('scheduled_at', '>=', now())->orderBy('scheduled_at')->limit(10)->get()
            ->map(fn ($v) => [
                'id' => (string) $v->id, 'property' => $v->listing?->title ?? '—', 'client' => $v->client_name,
                'agentId' => 'AGT-'.str_pad((string) $v->agent_id, 3, '0', STR_PAD_LEFT),
                'date' => $v->scheduled_at->toDateString(), 'time' => $v->scheduled_at->format('H:i'), 'status' => 'Confirmed',
            ]);

        return response()->json(['data' => compact('performance', 'pipeline', 'agents', 'viewings')]);
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate([
            'name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:users,email', 'phone' => 'nullable|string|max:30',
            'zone' => 'nullable|string|max:100', 'status' => ['nullable', Rule::in(array_keys(self::STATUS_IN))],
        ]);
        $temp = Str::random(14);
        $u = User::create([
            'name' => $d['name'], 'email' => $d['email'], 'phone' => $d['phone'] ?? null, 'role' => 'agent',
            'status' => self::STATUS_IN[$d['status'] ?? 'Active'], 'password' => Hash::make($temp),
            'avatar_url' => 'https://ui-avatars.com/api/?name='.urlencode($d['name']).'&background=0A5C36&color=fff',
        ]);
        AgentProfile::create(['user_id' => $u->id, 'zone' => $d['zone'] ?? null]);

        return response()->json(['data' => ['id' => 'AGT-'.str_pad((string) $u->id, 3, '0', STR_PAD_LEFT)], 'temporary_password' => $temp], 201);
    }

    public function update(Request $r, string $id): JsonResponse
    {
        $d = $r->validate(['status' => ['sometimes', Rule::in(array_keys(self::STATUS_IN))], 'zone' => 'sometimes|nullable|string|max:100', 'quarterly_target' => 'sometimes|numeric|min:0']);
        $u = User::where('role', 'agent')->findOrFail((int) preg_replace('/\D/', '', $id));
        if (isset($d['status'])) $u->update(['status' => self::STATUS_IN[$d['status']]]);
        $prof = AgentProfile::firstOrCreate(['user_id' => $u->id]);
        if (array_key_exists('zone', $d)) $prof->zone = $d['zone'];
        if (isset($d['quarterly_target'])) $prof->quarterly_target_kobo = (int) round($d['quarterly_target'] * 100);
        $prof->save();

        return response()->json(['status' => 'success']);
    }
}
