<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * KAN-14 / KAN-15: login by email, set-password link for admin-created accounts.
 */
class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['These credentials do not match our records.']]);
        }
        if ($user->status !== 'active') {
            throw ValidationException::withMessages(['email' => ["This account is {$user->status}. Contact the estate admin."]]);
        }

        $user->forceFill(['last_active_at' => now()])->save();

        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => $user->createToken('web')->plainTextToken,
                'user' => $this->present($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => $this->present($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }

    /** Sends (or re-sends) the set/reset password link. Always answers 200 so emails cannot be probed. */
    public function sendSetPasswordLink(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        Password::sendResetLink($data);

        return response()->json(['status' => 'success', 'message' => 'If the email exists, a link has been sent.']);
    }

    public function setPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $result = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
            $user->tokens()->delete();
        });

        if ($result !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($result)]]);
        }

        return response()->json(['status' => 'success', 'message' => 'Password saved. You can now log in.']);
    }

    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'roles' => $user->getRoleNames(),
            'status' => $user->status,
            'avatar_url' => $user->avatar_url,
        ];
    }
}
