<?php

use App\Http\Controllers\Api\ActivityCatalogController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\SubjectController;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

Route::get('/subjects', [SubjectController::class, 'publicIndex']);

Route::middleware([
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    ValidateCsrfToken::class,
])->group(function (): void {
    Route::get('/csrf-token', [AdminAuthController::class, 'csrfToken']);
    Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/admin/register', [AdminAuthController::class, 'register'])->middleware('throttle:3,1');

    Route::prefix('admin')->middleware('supabase.admin')->group(function (): void {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/session', fn () => response()->json(['authenticated' => true]));
        Route::get('/achievements', [ActivityCatalogController::class, 'achievements']);
        Route::get('/rewards', [ActivityCatalogController::class, 'rewards']);

        Route::apiResource('subjects', SubjectController::class)->except(['show']);
        Route::post('/activities/cover', [ActivityController::class, 'uploadCover']);
        Route::post('/activities/media', [ActivityController::class, 'uploadMedia']);
        Route::post('/subjects/{subject}/activities', [ActivityController::class, 'store']);
        Route::put('/activities/{activity}', [ActivityController::class, 'update']);
        Route::delete('/activities/{activity}', [ActivityController::class, 'destroy']);
    });
});
