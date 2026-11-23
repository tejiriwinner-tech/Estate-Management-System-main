<?php

use App\Http\Controllers\Api\StoreDashboardController;
use App\Http\Controllers\Api\V1\Store\StoreOwnerController;
use Illuminate\Support\Facades\Route;

// Legacy single-merchant preview dashboard (kept for existing consumers)
Route::get('/store/dashboard', StoreDashboardController::class)->name('store.dashboard');

// Public catalogue of open stores
Route::get('/v1/store/catalog', [StoreOwnerController::class, 'catalog']);

// A store owner's own store
Route::prefix('v1/store')->middleware(['auth:sanctum', 'role:store_owner|admin|super_admin'])->group(function () {
    Route::get('me', [StoreOwnerController::class, 'me']);
    Route::post('register', [StoreOwnerController::class, 'register']);
    Route::patch('me', [StoreOwnerController::class, 'update']);
    Route::put('plan', [StoreOwnerController::class, 'choosePlan']);
    Route::get('invoices', [StoreOwnerController::class, 'invoices']);
    Route::get('owner-dashboard', [StoreOwnerController::class, 'dashboard']);
    Route::get('products', [StoreOwnerController::class, 'products']);
    Route::post('products', [StoreOwnerController::class, 'storeProduct']);
    Route::put('products/{id}', [StoreOwnerController::class, 'updateProduct']);
    Route::delete('products/{id}', [StoreOwnerController::class, 'destroyProduct']);
});
