<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ReminderController;
use App\Http\Controllers\Api\V1\Admin\EstateUpdateController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Admin\StaffController;
use App\Http\Controllers\Api\V1\Admin\AccessController;
use App\Http\Controllers\Api\V1\Admin\AwayController;
use App\Http\Controllers\Api\V1\Admin\VehicleController;
use App\Http\Controllers\Api\V1\Admin\ReportsController;

/*
|--------------------------------------------------------------------------
| API Routes - LincolnEstate
|--------------------------------------------------------------------------
| Prefix: /api/v1
*/

Route::prefix('v1')->group(function () {
    // Admin Routes
    Route::prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);
        Route::get('/dashboard/access-logs', [DashboardController::class, 'accessLogs']);

        // Reminders
        Route::apiResource('reminders', ReminderController::class);
        Route::patch('reminders/{id}/toggle-complete', [ReminderController::class, 'toggleComplete']);

        // Estate Updates
        Route::get('/estate-updates/latest', [EstateUpdateController::class, 'latest']);
        Route::apiResource('estate-updates', EstateUpdateController::class);

        // User & Resident Management (Tasks 2 & 3)
        Route::get('users/stats', [UserController::class, 'stats']);
        Route::post('users/{id}/approve', [UserController::class, 'approve']);
        Route::post('users/{id}/reject', [UserController::class, 'reject']);
        Route::patch('users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::apiResource('users', UserController::class);

        // Check-in / check-out monitoring
        Route::get('reports', [ReportsController::class, 'index']);
        Route::get('access', [AccessController::class, 'index']);

        // Away notifications
        Route::get('away', [AwayController::class, 'index']);
        Route::post('away', [AwayController::class, 'store']);
        Route::put('away/{id}', [AwayController::class, 'update']);
        Route::post('away/{id}/returned', [AwayController::class, 'markReturned']);

        // Vehicles & gate scanners
        Route::get('vehicles', [VehicleController::class, 'index']);
        Route::post('vehicles', [VehicleController::class, 'store']);
        Route::patch('vehicles/{id}', [VehicleController::class, 'update']);
        Route::delete('vehicles/{id}', [VehicleController::class, 'destroy']);
        Route::post('scanners', [VehicleController::class, 'storeScanner']);
        Route::patch('scanners/{id}', [VehicleController::class, 'updateScanner']);
        Route::post('scanners/{id}/ping', [VehicleController::class, 'pingScanner']);

        // Staff Management (Task 4 & 5)
        Route::get('staff/metrics', [StaffController::class, 'metrics']);
        Route::get('staff/activities', [StaffController::class, 'activities']);
        Route::post('staff/{id}/reset-password', [StaffController::class, 'resetPassword']);
        Route::apiResource('staff', StaffController::class);
    });
});
