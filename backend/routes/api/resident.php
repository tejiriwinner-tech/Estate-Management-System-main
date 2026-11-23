<?php

use App\Http\Controllers\Api\V1\Resident\ResidentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/resident')->middleware(['auth:sanctum', 'role:resident'])->group(function () {
    Route::get('dashboard', [ResidentController::class, 'dashboard']);

    Route::get('profile', [ResidentController::class, 'profile']);
    Route::put('profile', [ResidentController::class, 'updateProfile']);
    Route::put('settings', [ResidentController::class, 'updateSettings']);
    Route::post('change-password', [ResidentController::class, 'changePassword']);

    Route::get('family', [ResidentController::class, 'family']);
    Route::post('family', [ResidentController::class, 'addFamilyMember']);
    Route::put('family/{id}', [ResidentController::class, 'updateFamilyMember']);
    Route::delete('family/{id}', [ResidentController::class, 'deleteFamilyMember']);

    Route::get('properties', [ResidentController::class, 'properties']);
    Route::post('properties', [ResidentController::class, 'registerProperty']);
    Route::delete('properties/{id}', [ResidentController::class, 'deleteProperty']);

    Route::get('activity', [ResidentController::class, 'activity']);
    Route::post('activity/check-out', [ResidentController::class, 'checkOut']);
    Route::post('activity/{id}/check-in', [ResidentController::class, 'checkIn']);

    Route::post('panic', [ResidentController::class, 'panic'])->middleware('throttle:6,1');
});
