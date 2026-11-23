<?php

namespace App\Http\Controllers\Api\V1\Resident;

use App\Http\Controllers\Controller;
use App\Models\EstateUpdate;
use App\Models\FamilyMember;
use App\Models\PanicAlert;
use App\Models\Reminder;
use App\Models\ResidentActivity;
use App\Models\ResidentProperty;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Resident app API (KAN-30 to KAN-35). Every query is scoped to the signed-in user.
 */
class ResidentController extends Controller
{
    private function ok($data, int $code = 200): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => $data], $code);
    }

    /** Figma dashboard: Neighbors, Total Payment Made, Family Activities, Reminder list, Update From Estate Admin. */
    public function dashboard(Request $request): JsonResponse
    {
        $u = $request->user();
        $block = $u->unit_number ? strtok($u->unit_number, '-') : null;

        $neighbors = User::where('role', 'resident')->where('id', '!=', $u->id)
            ->when($block, fn ($q) => $q->where('unit_number', 'like', $block.'%'))->count();

        // total of successful payments (stored in kobo)
        $paid = \App\Models\Payment::where('user_id', $u->id)->where('status', 'success')->sum('amount_kobo') / 100;

        return $this->ok([
            'neighbors' => $neighbors,
            'total_paid' => (float) $paid,
            'family_activities' => ResidentActivity::where('user_id', $u->id)->whereDate('created_at', today())->count(),
            'reminders' => Reminder::where('user_id', $u->id)->orderBy('is_completed')->latest()->limit(8)->get(),
            'estate_update' => EstateUpdate::latest('published_at')->first(),
        ]);
    }

    // ---- profile + About + Settings ----
    public function profile(Request $request): JsonResponse
    {
        $u = $request->user();
        $prefs = UserPreference::firstOrCreate(['user_id' => $u->id]);

        return $this->ok([
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'phone' => $u->phone,
            'unit_number' => $u->unit_number, 'avatar_url' => $u->avatar_url,
            'resident_code' => 'LE'.str_pad((string) $u->id, 6, '0', STR_PAD_LEFT),
            'about' => $prefs->about,
            'settings' => $prefs->only(['sms_notifications', 'email_notifications', 'members_can_chat']),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $u = $request->user();
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'phone' => 'sometimes|nullable|string|max:30',
            'about' => 'sometimes|nullable|string|max:2000',
        ]);
        $u->fill(collect($data)->only(['name', 'phone'])->all())->save();
        if (array_key_exists('about', $data)) {
            UserPreference::updateOrCreate(['user_id' => $u->id], ['about' => $data['about']]);
        }

        return $this->profile($request);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sms_notifications' => 'sometimes|boolean',
            'email_notifications' => 'sometimes|boolean',
            'members_can_chat' => 'sometimes|boolean',
        ]);
        $p = UserPreference::updateOrCreate(['user_id' => $request->user()->id], $data);

        return $this->ok($p->only(['sms_notifications', 'email_notifications', 'members_can_chat']));
    }

    /** Figma "Chang Password" button. */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $u = $request->user();
        if (! Hash::check($data['current_password'], $u->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }
        $u->forceFill(['password' => Hash::make($data['password'])])->save();

        return $this->ok(['message' => 'Password changed']);
    }

    // ---- family members ----
    public function family(Request $request): JsonResponse
    {
        return $this->ok(FamilyMember::where('user_id', $request->user()->id)->orderBy('id')->get());
    }

    public function addFamilyMember(Request $request): JsonResponse
    {
        $d = $request->validate([
            'name' => 'required|string|max:120',
            'role_in_family' => 'required|string|max:50',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => ['nullable', Rule::in(['Male', 'Female'])],
        ]);

        return $this->ok(FamilyMember::create($d + ['user_id' => $request->user()->id]), 201);
    }

    public function updateFamilyMember(Request $request, int $id): JsonResponse
    {
        $m = FamilyMember::where('user_id', $request->user()->id)->findOrFail($id);
        $m->update($request->validate([
            'name' => 'sometimes|required|string|max:120',
            'role_in_family' => 'sometimes|required|string|max:50',
            'age' => 'nullable|integer|min:0|max:120',
            'gender' => ['nullable', Rule::in(['Male', 'Female'])],
        ]));

        return $this->ok($m);
    }

    public function deleteFamilyMember(Request $request, int $id): JsonResponse
    {
        FamilyMember::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return $this->ok(['message' => 'Removed']);
    }

    // ---- properties (house, car, other) + registration ----
    public function properties(Request $request): JsonResponse
    {
        return $this->ok(ResidentProperty::where('user_id', $request->user()->id)->latest()->get());
    }

    public function registerProperty(Request $request): JsonResponse
    {
        $d = $request->validate([
            'type' => ['required', Rule::in(['house', 'car', 'other'])],
            'name' => 'required|string|max:120',
            'property_number' => 'required|string|max:60',
            'sector' => 'nullable|string|max:60',
            'unit_type' => 'nullable|string|max:60',
            'ownership_status' => 'nullable|string|max:60',
            'colour' => 'nullable|string|max:40',
            'others' => 'nullable|string|max:120',
            'draft' => 'sometimes|boolean',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB, as the Figma form says
        ]);
        $path = $request->file('document')?->store('property-documents');
        $p = ResidentProperty::create(collect($d)->except(['draft', 'document'])->all() + [
            'user_id' => $request->user()->id,
            'document_path' => $path,
            'status' => $request->boolean('draft') ? 'draft' : 'pending',
        ]);

        return $this->ok($p, 201);
    }

    public function deleteProperty(Request $request, int $id): JsonResponse
    {
        ResidentProperty::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return $this->ok(['message' => 'Removed']);
    }

    // ---- activity (family check in / out) ----
    public function activity(Request $request): JsonResponse
    {
        return $this->ok(ResidentActivity::where('user_id', $request->user()->id)->latest()->limit(100)->get());
    }

    public function checkOut(Request $request): JsonResponse
    {
        $d = $request->validate(['name' => 'required|string|max:120', 'out_with' => 'nullable|string|max:60']);

        return $this->ok(ResidentActivity::create($d + ['user_id' => $request->user()->id, 'out_at' => now()]), 201);
    }

    public function checkIn(Request $request, int $id): JsonResponse
    {
        $a = ResidentActivity::where('user_id', $request->user()->id)->whereNull('in_at')->findOrFail($id);
        $a->update(['in_at' => now()] + $request->validate(['in_with' => 'nullable|string|max:60']));

        return $this->ok($a);
    }

    // ---- panic ("life under threat") ----
    public function panic(Request $request): JsonResponse
    {
        $d = $request->validate(['location' => 'nullable|string|max:150', 'note' => 'nullable|string|max:500']);
        $u = $request->user();
        $alert = PanicAlert::create([
            'user_id' => $u->id,
            'location' => $d['location'] ?? $u->unit_number,
            'note' => $d['note'] ?? null,
        ]);

        // Surface it in the shared alert list and notify security/admin staff.
        $shared = \App\Models\EstateAlert::create([
            'sender_id' => $u->id,
            'category' => 'life_threat',
            'message' => 'Life under threat'.($d['note'] ?? false ? ': '.$d['note'] : ''),
            'location' => $alert->location,
        ]);
        foreach (\App\Models\User::whereIn('role', ['super_admin', 'admin', 'manager', 'security'])->pluck('id') as $uid) {
            \App\Models\AppNotification::create([
                'user_id' => $uid, 'type' => 'alert',
                'title' => $u->name.' sent you an alert',
                'body' => 'Life under threat'.($alert->location ? ' at '.$alert->location : ''),
                'data' => ['alert_id' => $shared->id, 'category' => 'life_threat'],
            ]);
        }

        return $this->ok(['id' => $alert->id, 'message' => 'Security has been alerted.'], 201);
    }
}
