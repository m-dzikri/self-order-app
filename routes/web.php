<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', OrderSessionController::class)->name('welcome');
Route::post('/session/takeaway', [OrderSessionController::class, 'storeTakeaway'])->name('session.takeaway');
Route::get('/katalog', CatalogController::class)->name('catalog');
Route::get('/keranjang', CartController::class)->name('cart');
Route::post('/order/checkout', [OrderController::class, 'store'])->name('order.checkout');
