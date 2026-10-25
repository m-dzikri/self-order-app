<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Store a newly created order with server-side pricing verification (RFC-006, F16, F19, SEC-1).
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->input('session_type') === 'takeaway') {
            $request->merge(['table_number' => null]);
        } elseif ($request->filled('table_number')) {
            $request->merge(['table_number' => (string) $request->input('table_number')]);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|in:qris,ewallet,kasir',
            'items' => 'required|array|min:1',
            'items.*.menuId' => 'nullable|integer',
            'items.*.menu_id' => 'nullable|integer',
            'items.*.quantity' => 'required|integer|min:1|max:20',
            'items.*.temperature' => 'nullable|string',
            'items.*.sugarLevel' => 'nullable|string',
            'items.*.spiceLevel' => 'nullable|string',
            'items.*.eggOption' => 'nullable|string',
            'items.*.milk' => 'nullable',
            'items.*.toppings' => 'nullable|array',
            'items.*.notes' => 'nullable|string|max:500',
            'coupon_code' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'pickup_time' => 'nullable|string|max:20',
            'table_number' => 'nullable|max:10',
            'session_type' => 'nullable|string|in:dine_in,takeaway',
        ]);

        $session = $request->session()->get('order_session', []);

        $sessionType = $validated['session_type'] ?? ($session['type'] ?? $session['mode'] ?? 'takeaway');
        $tableNumber = $sessionType === 'dine_in'
            ? ($validated['table_number'] ?? ($session['table_number'] ?? null))
            : null;
        if ($tableNumber !== null) {
            $tableNumber = (string) $tableNumber;
        }
        $user = $request->user();
        $customerName = $validated['customer_name'] ?? ($user?->name ?? $session['customer_name'] ?? $session['name'] ?? null);
        $customerPhone = $validated['customer_phone'] ?? ($user?->phone ?? $session['customer_phone'] ?? $session['phone'] ?? null);
        $pickupTime = $validated['pickup_time'] ?? ($session['pickup_time'] ?? $session['pickupAt'] ?? null);

        // Strip HTML tags for security (SEC-1)
        if ($customerName) {
            $customerName = strip_tags($customerName);
        }

        return DB::transaction(function () use (
            $request,
            $validated,
            $sessionType,
            $tableNumber,
            $customerName,
            $customerPhone,
            $pickupTime
        ) {
            $subtotal = 0;
            $preparedItems = [];

            foreach ($validated['items'] as $itemData) {
                $menuId = $itemData['menuId'] ?? $itemData['menu_id'] ?? null;
                $menu = Menu::with('modifiers')->findOrFail($menuId);

                $unitPrice = $menu->price;
                $summaryParts = [];

                // Minuman: Suhu & Gula
                if (! empty($itemData['temperature'])) {
                    $summaryParts[] = $itemData['temperature'];
                }
                if (! empty($itemData['sugarLevel'])) {
                    $summaryParts[] = $itemData['sugarLevel'];
                }

                // Susu Modifier
                $milkData = $itemData['milk'] ?? null;
                if ($milkData) {
                    $milkName = is_array($milkData) ? ($milkData['name'] ?? '') : (string) $milkData;
                    if ($milkName && $milkName !== 'Fresh Milk (Reguler)') {
                        $modifier = $menu->modifiers->firstWhere('name', $milkName);
                        $milkExtra = $modifier ? $modifier->extra_price : 0;
                        $unitPrice += $milkExtra;
                        $summaryParts[] = $milkName;
                    }
                }

                // Topping Modifiers
                $toppings = $itemData['toppings'] ?? [];
                if (is_array($toppings)) {
                    foreach ($toppings as $top) {
                        $topName = is_array($top) ? ($top['name'] ?? '') : (string) $top;
                        if ($topName) {
                            $modifier = $menu->modifiers->firstWhere('name', $topName);
                            $topExtra = $modifier ? $modifier->extra_price : 0;
                            $unitPrice += $topExtra;
                            $summaryParts[] = '+ '.$topName;
                        }
                    }
                }

                // Makanan: Level Pedas & Telur
                if (! empty($itemData['spiceLevel'])) {
                    $summaryParts[] = $itemData['spiceLevel'];
                }
                if (! empty($itemData['eggOption'])) {
                    $summaryParts[] = $itemData['eggOption'];
                }

                $quantity = (int) $itemData['quantity'];
                $lineTotal = $unitPrice * $quantity;
                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'menu_id' => $menu->id,
                    'menu_name' => $menu->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                    'modifiers_summary' => implode(' • ', $summaryParts),
                    'special_notes' => isset($itemData['notes']) ? strip_tags(trim($itemData['notes'])) : null,
                ];
            }

            // Coupon validation (F13, SEC-1, TEST-3)
            $couponCode = isset($validated['coupon_code']) ? strtoupper(trim($validated['coupon_code'])) : null;
            $discount = 0;
            if ($couponCode === 'SKETCHKOPI') {
                $discount = (int) round($subtotal * 0.10);
            } else {
                $couponCode = null;
            }

            $taxableAmount = max(0, $subtotal - $discount);
            $pb1Tax = (int) round($taxableAmount * 0.10);
            $total = $taxableAmount + $pb1Tax;

            // Generate unique order code (Dine-In vs Takeaway)
            $orderCode = $sessionType === 'dine_in'
                ? '#ORD-'.rand(1000, 9999)
                : '#TK-'.rand(100, 999);

            // Determine order status according to DATA-4 state machine
            $paymentMethod = $validated['payment_method'];
            $status = $paymentMethod === Order::PAYMENT_CASHIER
                ? Order::STATUS_UNPAID_CASHIER
                : Order::STATUS_CONFIRMED;

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'order_code' => $orderCode,
                'session_type' => $sessionType,
                'table_number' => $tableNumber,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'pickup_time' => $pickupTime,
                'payment_method' => $paymentMethod,
                'status' => $status,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'coupon_code' => $couponCode,
                'pb1_tax' => $pb1Tax,
                'total' => $total,
                'notes' => isset($validated['notes']) ? strip_tags($validated['notes']) : null,
            ]);

            foreach ($preparedItems as $item) {
                $order->items()->create($item);
            }

            // Generate Snap Token via Midtrans for online payment (QRIS / E-Wallet)
            if (in_array($paymentMethod, [Order::PAYMENT_QRIS, Order::PAYMENT_EWALLET], true)) {
                app(MidtransService::class)->createSnapToken($order);
            }

            // Save active order to customer session for tracker isolation (SEC-3, RFC-007)
            $activeOrders = $request->session()->get('active_order_ids', []);
            $activeOrders[] = $order->id;
            $request->session()->put('active_order_ids', array_values(array_unique($activeOrders)));
            $request->session()->put('current_order_id', $order->id);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'order' => [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'snap_token' => $order->snap_token,
                    'subtotal' => $order->subtotal,
                    'discount' => $order->discount,
                    'pb1_tax' => $order->pb1_tax,
                    'total' => $order->total,
                    'session_type' => $order->session_type,
                    'table_number' => $order->table_number,
                    'customer_name' => $order->customer_name,
                    'created_at' => $order->created_at->toISOString(),
                ],
            ], 201);
        });
    }
}
