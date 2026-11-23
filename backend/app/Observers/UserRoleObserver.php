<?php

namespace App\Observers;

use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * Keeps the Spatie role in step with the `users.role` column written by the admin module,
 * so the admin code does not need to change.
 */
class UserRoleObserver
{
    public function saved(User $user): void
    {
        $role = $user->role ?: 'resident';
        if (! in_array($role, config('estate.roles'), true) || ! Role::where('name', $role)->where('guard_name', 'web')->exists()) {
            return;
        }
        if (! $user->hasRole($role) || $user->roles()->count() !== 1) {
            $user->syncRoles([$role]);
        }
    }
}
