<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API entry point (merged project)
|--------------------------------------------------------------------------
| Each module keeps its own route file exactly as its author wrote it:
|   routes/api/finance.php  finance, payments, staffs, management (main)
|   routes/api/admin.php    /v1/admin/*                           (admin)
|   routes/api/store.php    /store/dashboard                      (store)
|   routes/api/agents.php   agent listings + admin approval + public landing (new)
| Auth routes below are new (KAN-14 / KAN-15).
*/

Route::prefix('v1/auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'sendSetPasswordLink']);
    Route::post('set-password', [AuthController::class, 'setPassword']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Existing module routes are wrapped, not edited. With ESTATE_ENFORCE_AUTH=true they require a
// Sanctum login and the role shown. Off by default because the front end does not send tokens yet.
$enforce = config('estate.enforce_auth');

Route::middleware($enforce ? ['auth:sanctum', 'role:admin|super_admin|manager'] : [])->group(function () {
    require __DIR__.'/api/finance.php';
    require __DIR__.'/api/admin.php';
});
Route::middleware($enforce ? ['auth:sanctum', 'role:store_owner|admin|super_admin'] : [])->group(function () {
    require __DIR__.'/api/store.php';
});

require __DIR__.'/api/agents.php';   // carries its own auth + role middleware
require __DIR__.'/api/resident.php'; // carries its own auth + role middleware
require __DIR__.'/api/chat.php';     // shared chat, notifications, alerts, meetings (auth:sanctum)
require __DIR__.'/api/security.php'; // carries its own auth + role middleware
