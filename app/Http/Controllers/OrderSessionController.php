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
                ['mode' => 'dine_in', 'table_number' => (int) $table],
            ));
        }

        $orderSession = $request->session()->get('order_session', []);

        return Inertia::render('Welcome', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'mode' => $orderSession['mode'] ?? 'takeaway',
            'tableNumber' => $orderSession['table_number'] ?? null,
            'orderSession' => [
                'name' => $orderSession['name'] ?? null,
                'phone' => $orderSession['phone'] ?? null,
                'pickupAt' => $orderSession['pickup_at'] ?? null,
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
}
