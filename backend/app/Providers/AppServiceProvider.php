<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserRoleObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        User::observe(UserRoleObserver::class);

        // Set/reset-password links open the Next.js app.
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim(config('estate.frontend_url'), '/')
            .'/set-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset()));
    }
}
