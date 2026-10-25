<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackerController extends Controller
{
    /**
     * Display real-time order tracking screen (F21, RFC-007, SEC-3).
     */
    public function show(Request $request, string $identifier): Response
    {
        $order = $this->resolveOrder($identifier);

        $this->authorizeOrderAccess($request, $order);

        $order->load(['items.menu']);

        return Inertia::render('Tracker', [
            'order' => [
                'id' => $order->id,
                'user_id' => $order->user_id,
                'order_code' => $order->order_code,
                'session_type' => $order->session_type,
                'table_number' => $order->table_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'pickup_time' => $order->pickup_time,
                'payment_method' => $order->payment_method,
                'status' => $order->status,
                'subtotal' => $order->subtotal,
                'discount' => $order->discount,
                'coupon_code' => $order->coupon_code,
                'pb1_tax' => $order->pb1_tax,
                'total' => $order->total,
                'notes' => $order->notes,
                'created_at' => $order->created_at->toISOString(),
                'updated_at' => $order->updated_at->toISOString(),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'menu_id' => $item->menu_id,
                    'menu_name' => $item->menu_name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'modifiers_summary' => $item->modifiers_summary,
                    'special_notes' => $item->special_notes,
                ]),
            ],
        ]);
    }

    /**
     * Lightweight status polling endpoint for real-time stepper updates (F21).
     */
    public function pollStatus(Request $request, string $orderCode): JsonResponse
    {
        $order = $this->resolveOrder($orderCode);

        $this->authorizeOrderAccess($request, $order);

        return response()->json([
            'success' => true,
            'order_code' => $order->order_code,
            'status' => $order->status,
            'updated_at' => $order->updated_at->toISOString(),
            'is_ready' => $order->status === Order::STATUS_READY,
            'is_completed' => $order->status === Order::STATUS_COMPLETED,
        ]);
    }

    /**
     * Simulation status endpoint for demo & testing control panel (F22, TC-007-4).
     */
    public function simulateStatus(Request $request, string $orderCode): JsonResponse
    {
        $order = $this->resolveOrder($orderCode);

        $this->authorizeOrderAccess($request, $order);

        $validated = $request->validate([
            'status' => 'required|string|in:unpaid_cashier,confirmed,in_progress,ready,completed,cancelled',
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil disimulasikan menjadi '.$validated['status'],
            'status' => $order->status,
            'updated_at' => $order->updated_at->toISOString(),
        ]);
    }

    /**
     * Interactive "Panggil Pelayan / Barista" call button handler.
     */
    public function callServer(Request $request, string $orderCode): JsonResponse
    {
        $order = $this->resolveOrder($orderCode);

        $this->authorizeOrderAccess($request, $order);

        $location = $order->session_type === 'dine_in' && $order->table_number
            ? 'Meja '.$order->table_number
            : 'Area Ambil Takeaway';

        return response()->json([
            'success' => true,
            'message' => "Panggilan diterima! Barista/Pelayan segera meluncur ke {$location}. 🛎️✨",
        ]);
    }

    /**
     * Resolve order by ID or order_code.
     */
    private function resolveOrder(string $identifier): Order
    {
        $decoded = rawurldecode($identifier);

        if (is_numeric($decoded)) {
            return Order::findOrFail((int) $decoded);
        }

        return Order::where('order_code', $decoded)
            ->orWhere('order_code', '#'.$decoded)
            ->firstOrFail();
    }

    /**
     * Authorize customer access to order based on session (SEC-3).
     */
    private function authorizeOrderAccess(Request $request, Order $order): void
    {
        $activeOrders = (array) $request->session()->get('active_order_ids', []);
        $currentOrderId = $request->session()->get('current_order_id');

        // Staf / Admin kafe berhak melihat seluruh pesanan (Filament, KDS, Kasir)
        $isAdmin = auth()->check() && auth()->user()->role !== 'customer';

        // Member terotentikasi berhak melihat pesanan miliknya sendiri
        $isMemberOwner = auth()->check() && $order->user_id !== null && $order->user_id === auth()->id();

        // Tamu (guest) hanya berhak melihat pesanan guest yang ada di sesi aktif browsernya
        $isGuestOwner = ! auth()->check() && $order->user_id === null && (in_array($order->id, $activeOrders) || $currentOrderId == $order->id);

        if (! $isAdmin && ! $isMemberOwner && ! $isGuestOwner) {
            abort(403, 'Akses ditolak: Anda hanya dapat memantau pesanan aktif milik Anda sendiri.');
        }
    }
}
