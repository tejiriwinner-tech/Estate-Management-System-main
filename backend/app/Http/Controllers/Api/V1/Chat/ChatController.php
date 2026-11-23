<?php

namespace App\Http\Controllers\Api\V1\Chat;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\EstateAlert;
use App\Models\MeetingReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    private const STAFF_ROLES = ['super_admin', 'admin', 'manager', 'security'];

    // ---------- helpers ----------
    private function userBrief(User $u): array
    {
        return ['id' => $u->id, 'name' => $u->name, 'unit_number' => $u->unit_number, 'avatar_url' => $u->avatar_url, 'role' => $u->role];
    }

    private function sharedRoom(string $type, string $name): ChatRoom
    {
        return ChatRoom::firstOrCreate(['type' => $type], ['name' => $name]);
    }

    private function joinRoom(ChatRoom $room, User $user): void
    {
        DB::table('chat_room_members')->updateOrInsert(
            ['chat_room_id' => $room->id, 'user_id' => $user->id],
            ['updated_at' => now(), 'created_at' => now()]
        );
    }

    private function authorizeRoom(Request $r, int $id): ChatRoom
    {
        $room = ChatRoom::findOrFail($id);
        if ($room->type === 'direct' && ! $room->members()->where('users.id', $r->user()->id)->exists()) {
            abort(403, 'You are not part of this conversation.');
        }
        return $room;
    }

    private function unreadFor(ChatRoom $room, int $userId): int
    {
        $last = DB::table('chat_room_members')->where(['chat_room_id' => $room->id, 'user_id' => $userId])->value('last_read_at');
        return $room->messages()->where('user_id', '!=', $userId)
            ->when($last, fn ($q) => $q->where('created_at', '>', $last))->count();
    }

    private function messageOut(ChatMessage $m): array
    {
        return ['id' => $m->id, 'room_id' => $m->chat_room_id, 'body' => $m->body, 'created_at' => $m->created_at?->toIso8601String(), 'mine' => $m->user_id === request()->user()?->id, 'user' => $this->userBrief($m->user)];
    }

    // ---------- rooms ----------
    public function rooms(Request $r): JsonResponse
    {
        $me = $r->user();
        $rooms = [
            $this->sharedRoom('estate', 'Estate Community'),
            $this->sharedRoom('security', 'Security Room'),
        ];
        $direct = ChatRoom::where('type', 'direct')
            ->whereHas('members', fn ($q) => $q->where('users.id', $me->id))
            ->with('members')->get();

        $out = [];
        foreach (array_merge($rooms, $direct->all()) as $room) {
            $last = $room->messages()->with('user')->latest('id')->first();
            $other = null;
            if ($room->type === 'direct') {
                $other = $room->members->firstWhere('id', '!=', $me->id);
            }
            $out[] = [
                'id' => $room->id,
                'type' => $room->type,
                'name' => $other?->name ?? $room->name,
                'subtitle' => $other ? ($other->unit_number ? 'House Number '.$other->unit_number : ucfirst((string) $other->role)) : null,
                'avatar_url' => $other?->avatar_url,
                'other_user_id' => $other?->id,
                'last_message' => $last ? ['body' => $last->body, 'created_at' => $last->created_at?->toIso8601String(), 'from' => $last->user?->name] : null,
                'unread' => $this->unreadFor($room, $me->id),
            ];
        }
        usort($out, fn ($a, $b) => strcmp($b['last_message']['created_at'] ?? '', $a['last_message']['created_at'] ?? ''));
        return response()->json(['data' => $out]);
    }

    public function directory(Request $r): JsonResponse
    {
        $q = trim((string) $r->query('q', ''));
        $users = User::where('id', '!=', $r->user()->id)
            ->when($q !== '', fn ($b) => $b->where('name', 'like', "%{$q}%"))
            ->orderBy('name')->limit(100)->get();
        return response()->json(['data' => $users->map(fn ($u) => $this->userBrief($u))->values()]);
    }

    public function openDirect(Request $r): JsonResponse
    {
        $data = $r->validate(['user_id' => 'required|integer|exists:users,id']);
        $me = $r->user();
        abort_if((int) $data['user_id'] === $me->id, 422, 'You cannot message yourself.');
        $key = min($me->id, (int) $data['user_id']).':'.max($me->id, (int) $data['user_id']);
        $room = ChatRoom::firstOrCreate(['direct_key' => $key], ['type' => 'direct']);
        $this->joinRoom($room, $me);
        $this->joinRoom($room, User::findOrFail($data['user_id']));
        return response()->json(['data' => ['id' => $room->id]]);
    }

    public function messages(Request $r, int $id): JsonResponse
    {
        $room = $this->authorizeRoom($r, $id);
        $after = (int) $r->query('after_id', 0);
        $msgs = $room->messages()->with('user')
            ->when($after, fn ($q) => $q->where('id', '>', $after))
            ->orderByDesc('id')->limit(100)->get()->reverse()->values();
        return response()->json(['data' => $msgs->map(fn ($m) => $this->messageOut($m))->values()]);
    }

    public function send(Request $r, int $id): JsonResponse
    {
        $room = $this->authorizeRoom($r, $id);
        $data = $r->validate(['body' => 'required|string|max:2000']);
        $me = $r->user();
        $this->joinRoom($room, $me);
        $msg = $room->messages()->create(['user_id' => $me->id, 'body' => trim($data['body'])]);
        $msg->load('user');

        if ($room->type === 'direct') {
            foreach ($room->members()->where('users.id', '!=', $me->id)->pluck('users.id') as $uid) {
                AppNotification::create([
                    'user_id' => $uid, 'type' => 'message',
                    'title' => $me->name.' sent you a message',
                    'body' => mb_strimwidth($msg->body, 0, 140, '…'),
                    'data' => ['room_id' => $room->id],
                ]);
            }
        }
        DB::table('chat_room_members')->where(['chat_room_id' => $room->id, 'user_id' => $me->id])->update(['last_read_at' => now()]);
        return response()->json(['data' => $this->messageOut($msg)], 201);
    }

    public function markRead(Request $r, int $id): JsonResponse
    {
        $room = $this->authorizeRoom($r, $id);
        $this->joinRoom($room, $r->user());
        DB::table('chat_room_members')->where(['chat_room_id' => $room->id, 'user_id' => $r->user()->id])->update(['last_read_at' => now()]);
        AppNotification::where('user_id', $r->user()->id)->where('type', 'message')->whereNull('read_at')
            ->where('data->room_id', $room->id)->update(['read_at' => now()]);
        return response()->json(['data' => ['ok' => true]]);
    }

    // ---------- notifications ----------
    public function notifications(Request $r): JsonResponse
    {
        $q = AppNotification::where('user_id', $r->user()->id);
        $items = (clone $q)->latest('id')->limit(50)->get();
        return response()->json(['data' => [
            'unread_count' => (clone $q)->whereNull('read_at')->count(),
            'items' => $items->map(fn ($n) => [
                'id' => $n->id, 'type' => $n->type, 'title' => $n->title, 'body' => $n->body,
                'data' => $n->data, 'read' => (bool) $n->read_at, 'created_at' => $n->created_at?->toIso8601String(),
            ])->values(),
        ]]);
    }

    public function summary(Request $r): JsonResponse
    {
        $uid = $r->user()->id;
        $base = AppNotification::where('user_id', $uid)->whereNull('read_at');
        return response()->json(['data' => [
            'unread_messages' => (clone $base)->where('type', 'message')->count(),
            'unread_alerts' => (clone $base)->where('type', 'alert')->count(),
            'unread_total' => (clone $base)->count(),
        ]]);
    }

    public function readNotification(Request $r, int $id): JsonResponse
    {
        AppNotification::where('user_id', $r->user()->id)->where('id', $id)->update(['read_at' => now()]);
        return response()->json(['data' => ['ok' => true]]);
    }

    public function readAllNotifications(Request $r): JsonResponse
    {
        $type = $r->query('type');
        AppNotification::where('user_id', $r->user()->id)->whereNull('read_at')
            ->when($type, fn ($q) => $q->where('type', $type))->update(['read_at' => now()]);
        return response()->json(['data' => ['ok' => true]]);
    }

    // ---------- alerts ----------
    public function alerts(Request $r): JsonResponse
    {
        $items = EstateAlert::with('sender')->latest('id')->limit(100)->get();
        return response()->json(['data' => $items->map(fn ($a) => [
            'id' => $a->id, 'category' => $a->category, 'message' => $a->message, 'location' => $a->location,
            'status' => $a->status, 'created_at' => $a->created_at?->toIso8601String(),
            'sender' => $a->sender ? $this->userBrief($a->sender) : null,
        ])->values()]);
    }

    public function createAlert(Request $r): JsonResponse
    {
        $data = $r->validate([
            'category' => 'required|in:life_threat,intelligence',
            'message' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);
        $me = $r->user();
        $alert = EstateAlert::create($data + ['sender_id' => $me->id]);

        $recipients = User::whereIn('role', self::STAFF_ROLES)->where('id', '!=', $me->id)->pluck('id');
        foreach ($recipients as $uid) {
            AppNotification::create([
                'user_id' => $uid, 'type' => 'alert',
                'title' => $me->name.' sent you an alert',
                'body' => $alert->message, 'data' => ['alert_id' => $alert->id, 'category' => $alert->category],
            ]);
        }
        return response()->json(['data' => ['id' => $alert->id]], 201);
    }

    public function resolveAlert(Request $r, int $id): JsonResponse
    {
        abort_unless(in_array($r->user()->role, self::STAFF_ROLES, true), 403);
        EstateAlert::findOrFail($id)->update(['status' => 'resolved']);
        return response()->json(['data' => ['ok' => true]]);
    }

    // ---------- meetings ----------
    public function meetings(): JsonResponse
    {
        $items = MeetingReport::latest('held_at')->latest('id')->limit(100)->get();
        return response()->json(['data' => $items->map(fn ($m) => [
            'id' => $m->id, 'title' => $m->title, 'body' => $m->body, 'held_at' => $m->held_at?->toIso8601String(),
        ])->values()]);
    }

    public function createMeeting(Request $r): JsonResponse
    {
        abort_unless(in_array($r->user()->role, self::STAFF_ROLES, true), 403);
        $data = $r->validate(['title' => 'required|string|max:160', 'body' => 'required|string|max:5000', 'held_at' => 'nullable|date']);
        $m = MeetingReport::create($data + ['created_by' => $r->user()->id, 'held_at' => $data['held_at'] ?? now()]);
        return response()->json(['data' => ['id' => $m->id]], 201);
    }
}
