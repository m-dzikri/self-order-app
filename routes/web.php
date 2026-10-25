<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\MemberAuthController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderSessionController;
use App\Http\Controllers\OrderTrackerController;
use App\Http\Controllers\TableQrController;
use Illuminate\Support\Facades\Route;

Route::get('/', OrderSessionController::class)->name('welcome');
Route::get('/meja-qr', [TableQrController::class, 'index'])->name('tables.qr');
Route::post('/session/takeaway', [OrderSessionController::class, 'storeTakeaway'])->name('session.takeaway');
Route::post('/session/switch-mode', [OrderSessionController::class, 'switchMode'])->name('session.switch-mode');
Route::get('/katalog', CatalogController::class)->name('catalog');
Route::get('/keranjang', CartController::class)->name('cart');
Route::post('/order/checkout', [OrderController::class, 'store'])->name('order.checkout');

// Order Tracker & Cashier Real-Time Routes (RFC-007, F20, F21, F22)
Route::get('/order/track/{identifier}', [OrderTrackerController::class, 'show'])->name('order.track');
Route::get('/order/{order_code}/status-poll', [OrderTrackerController::class, 'pollStatus'])->name('order.poll');
Route::post('/order/{order_code}/simulate-status', [OrderTrackerController::class, 'simulateStatus'])->name('order.simulate');
Route::post('/order/{order_code}/call-server', [OrderTrackerController::class, 'callServer'])->name('order.call-server');

// Member Authentication & Order History Routes (RFC-008, F24)
Route::post('/member/register', [MemberAuthController::class, 'register'])->name('member.register');
Route::post('/member/login', [MemberAuthController::class, 'login'])->name('member.login');
Route::post('/member/logout', [MemberAuthController::class, 'logout'])->name('member.logout');
Route::get('/member/history', [MemberAuthController::class, 'history'])->name('member.history');

// Midtrans Payment Gateway Webhook (Server-to-Server)
Route::post('/api/webhooks/midtrans', [MidtransWebhookController::class, 'handle'])->name('webhooks.midtrans');
