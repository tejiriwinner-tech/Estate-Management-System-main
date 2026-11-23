<?php

use App\Http\Controllers\Api\V1\Chat\ChatController;
use Illuminate\Support\Facades\Route;

// Shared by every signed-in role (resident, security, admin, ...).
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('chat/rooms', [ChatController::class, 'rooms']);
    Route::get('chat/directory', [ChatController::class, 'directory']);
    Route::post('chat/direct', [ChatController::class, 'openDirect']);
    Route::get('chat/rooms/{id}/messages', [ChatController::class, 'messages']);
    Route::post('chat/rooms/{id}/messages', [ChatController::class, 'send'])->middleware('throttle:60,1');
    Route::post('chat/rooms/{id}/read', [ChatController::class, 'markRead']);

    Route::get('notifications', [ChatController::class, 'notifications']);
    Route::get('notifications/summary', [ChatController::class, 'summary']);
    Route::post('notifications/read-all', [ChatController::class, 'readAllNotifications']);
    Route::post('notifications/{id}/read', [ChatController::class, 'readNotification']);

    Route::get('alerts', [ChatController::class, 'alerts']);
    Route::post('alerts', [ChatController::class, 'createAlert'])->middleware('throttle:10,1');
    Route::post('alerts/{id}/resolve', [ChatController::class, 'resolveAlert']);

    Route::get('meetings', [ChatController::class, 'meetings']);
    Route::post('meetings', [ChatController::class, 'createMeeting']);
});
