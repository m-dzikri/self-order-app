<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderSessionController;
use App\Http\Controllers\OrderTrackerController;
use Illuminate\Support\Facades\Route;

Route::get('/', OrderSessionController::class)->name('welcome');
Route::post('/session/takeaway', [OrderSessionController::class, 'storeTakeaway'])->name('session.takeaway');
Route::get('/katalog', CatalogController::class)->name('catalog');
Route::get('/keranjang', CartController::class)->name('cart');
Route::post('/order/checkout', [OrderController::class, 'store'])->name('order.checkout');

// Order Tracker & Cashier Real-Time Routes (RFC-007, F20, F21, F22)
Route::get('/order/track/{identifier}', [OrderTrackerController::class, 'show'])->name('order.track');
Route::get('/order/{order_code}/status-poll', [OrderTrackerController::class, 'pollStatus'])->name('order.poll');
Route::post('/order/{order_code}/simulate-status', [OrderTrackerController::class, 'simulateStatus'])->name('order.simulate');
Route::post('/order/{order_code}/call-server', [OrderTrackerController::class, 'callServer'])->name('order.call-server');
