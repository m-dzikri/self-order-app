<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTakeawayRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderSessionController extends Controller
{
    /**
     * Resolve the order session entry point (ARCH-4): a valid ?table=XX
     * query locks Dine-In mode; without it the visitor starts Takeaway.
     */
    public function __invoke(Request $request): Response
    {
        $table = $request->query('table');

        // QR meja selalu angka 1-999; nilai tidak valid diabaikan (fallback takeaway).
        if (is_string($table) && preg_match('/^[1-9]\d{0,2}$/', $table)) {
            $request->session()->put('order_session', array_merge(
                $request->session()->get('order_session', []),
                [
                    'mode' => 'dine_in',
                    'table_number' => (int) $table,
                ],
            ));
        }

        $orderSession = $request->session()->get('order_session', []);
        $isDineIn = ($orderSession['mode'] ?? $orderSession['type'] ?? 'takeaway') === 'dine_in'
            && ! empty($orderSession['table_number']);

        return Inertia::render('Welcome', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'mode' => $isDineIn ? 'dine_in' : 'takeaway',
            'tableNumber' => $isDineIn ? (int) $orderSession['table_number'] : null,
            'orderSession' => [
                'type' => $isDineIn ? 'dine_in' : 'takeaway',
                'mode' => $isDineIn ? 'dine_in' : 'takeaway',
                'table_number' => $isDineIn ? (int) $orderSession['table_number'] : null,
                'name' => $orderSession['name'] ?? $orderSession['customer_name'] ?? null,
                'customer_name' => $orderSession['customer_name'] ?? $orderSession['name'] ?? null,
                'phone' => $orderSession['phone'] ?? $orderSession['customer_phone'] ?? null,
                'customer_phone' => $orderSession['customer_phone'] ?? $orderSession['phone'] ?? null,
                'pickupAt' => $orderSession['pickup_at'] ?? $orderSession['pickup_time'] ?? null,
                'pickup_time' => $orderSession['pickup_time'] ?? $orderSession['pickup_at'] ?? null,
            ],
        ]);
    }

    /**
     * Store the takeaway session data (F2/F23). Sanitization (strip_tags)
     * happens in StoreTakeawayRequest::prepareForValidation (SEC-1), and
     * the SEC-2 rules live on that request class.
     */
    public function storeTakeaway(StoreTakeawayRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $order = array_merge($request->session()->get('order_session', []), [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'pickup_at' => $validated['pickup_at'],
        ]);

        // Sesi Dine-In terkunci (ARCH-4): pengajuan takeaway tidak mengubahnya.
        if (($order['mode'] ?? null) !== 'dine_in') {
            $order['mode'] = 'takeaway';
        }

        $request->session()->put('order_session', $order);

        return redirect()->route('welcome');
    }

    /**
     * Explicitly switch between takeaway and dine-in mode.
     */
    public function switchMode(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:takeaway,dine_in',
            'table_number' => 'nullable|integer|min:1|max:999',
        ]);

        $session = (array) $request->session()->get('order_session', []);

        if ($validated['mode'] === 'takeaway') {
            $session['mode'] = 'takeaway';
            $session['table_number'] = null;
        } else {
            $session['mode'] = 'dine_in';
            $session['table_number'] = (int) ($validated['table_number'] ?? $session['table_number'] ?? 1);
        }
        unset($session['type']);

        $request->session()->put('order_session', $session);

        return redirect()->back();
    }
}
