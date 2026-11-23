<?php

use App\Http\Controllers\Api\V1\Admin\ListingApprovalController;
use App\Http\Controllers\Api\V1\Agent\ListingController as AgentListingController;
use App\Http\Controllers\Api\V1\Public\ListingController as PublicListingController;
use App\Http\Controllers\Api\V1\Agent\PortalController;
use App\Http\Controllers\Api\V1\Admin\AgentsController;
use Illuminate\Support\Facades\Route;

// Public landing page (approved listings only, no login)
Route::prefix('v1/public')->group(function () {
    Route::get('listings', [PublicListingController::class, 'index']);
    Route::get('listings/{id}', [PublicListingController::class, 'show']);
    Route::post('listings/{id}/inquire', [PublicListingController::class, 'inquire'])->middleware('throttle:10,1');
});

// Agent dashboard: own listings
Route::prefix('v1/agent')->middleware(['auth:sanctum', 'role:agent'])->group(function () {
    Route::get('listings', [AgentListingController::class, 'index']);
    Route::post('listings', [AgentListingController::class, 'store']);
    Route::put('listings/{id}', [AgentListingController::class, 'update']);
    Route::patch('listings/{id}/availability', [AgentListingController::class, 'setAvailability']);
    Route::delete('listings/{id}', [AgentListingController::class, 'destroy']);

    Route::get('portal', [PortalController::class, 'show']);
    Route::patch('requests/{id}', [PortalController::class, 'updateRequest']);
    Route::post('viewings', [PortalController::class, 'bookViewing']);
    Route::patch('viewings/{id}', [PortalController::class, 'updateViewing']);
});

// Admin approval queue
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:admin|super_admin'])->group(function () {
    Route::get('listings', [ListingApprovalController::class, 'index']);
    Route::post('listings/{id}/approve', [ListingApprovalController::class, 'approve']);
    Route::post('listings/{id}/reject', [ListingApprovalController::class, 'reject']);

    Route::get('agents', [AgentsController::class, 'index']);
    Route::post('agents', [AgentsController::class, 'store']);
    Route::patch('agents/{id}', [AgentsController::class, 'update']);
});
