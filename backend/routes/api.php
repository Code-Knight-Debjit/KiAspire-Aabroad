<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class);
    Route::get('/ping', fn () => response()->json([
        'message' => 'pong',
    ]));
});

// Public: user registration (lead capture, no login flow — matches Node)
Route::prefix('user')->group(function (): void {
    Route::post('/register', [UserController::class, 'register']);
});

// Admin auth + user management
Route::prefix('admin')->group(function (): void {
    Route::post('/login', [AdminController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin.only'])->group(function (): void {
        Route::get('/profile', [AdminController::class, 'profile']);
        Route::get('/users', [AdminController::class, 'getAllUsers']);
        Route::get('/users/{id}', [AdminController::class, 'getUserById']);
        Route::patch('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    });
});

// Services
Route::prefix('services')->group(function (): void {
    Route::get('/', [ServiceController::class, 'index']);

    Route::middleware(['auth:sanctum', 'admin.only'])->group(function (): void {
        Route::get('/admin/all', [ServiceController::class, 'adminIndex']);
        Route::post('/', [ServiceController::class, 'store']);
        Route::patch('/{id}', [ServiceController::class, 'update']);
        Route::delete('/{id}', [ServiceController::class, 'destroy']);
    });
});

// Success stories
Route::prefix('story')->group(function (): void {
    Route::get('/', [StoryController::class, 'index']);
    Route::get('/{id}', [StoryController::class, 'show']);

    Route::middleware(['auth:sanctum', 'admin.only'])->group(function (): void {
        Route::post('/', [StoryController::class, 'store']);
        Route::patch('/{id}', [StoryController::class, 'update']);
        Route::delete('/{id}', [StoryController::class, 'destroy']);
    });
});
