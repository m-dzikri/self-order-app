<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OrderSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', OrderSessionController::class)->name('welcome');
Route::post('/session/takeaway', [OrderSessionController::class, 'storeTakeaway'])->name('session.takeaway');
Route::get('/katalog', CatalogController::class)->name('catalog');
