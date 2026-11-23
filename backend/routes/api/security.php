<?php

use App\Http\Controllers\Api\V1\Security\SecurityController;
use App\Http\Controllers\Api\V1\Security\OverviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/security')->middleware(['auth:sanctum', 'role:security|admin|super_admin|manager'])->group(function () {
    Route::get('dashboard', [OverviewController::class, 'dashboard']);
    Route::post('reminders', [OverviewController::class, 'storeReminder']);
    Route::get('intelligence', [OverviewController::class, 'intelligence']);
    Route::get('reports', [OverviewController::class, 'reports']);
    Route::get('activity', [OverviewController::class, 'activity']);
    Route::get('members', [OverviewController::class, 'members']);
    Route::get('hq', [OverviewController::class, 'hq']);

    Route::get('emergency', [SecurityController::class, 'emergency']);
    Route::post('emergency/report', [SecurityController::class, 'reportIncident'])->middleware('throttle:20,1');

    Route::get('access', [SecurityController::class, 'access']);
    Route::post('access/log', [SecurityController::class, 'logAccess']);
    Route::post('access/passes', [SecurityController::class, 'createPass']);

    Route::get('blacklist', [SecurityController::class, 'blacklist']);
    Route::post('blacklist', [SecurityController::class, 'addEntry']);
    Route::patch('blacklist/{id}', [SecurityController::class, 'updateEntry']);
});
