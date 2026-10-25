<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the shopping cart and temporary receipt docket (RFC-005, F12-F15).
     */
    public function __invoke(Request $request): Response
    {
        $menus = Menu::query()
            ->where('is_active', true)
            ->with([
                'category:id,name,slug',
                'modifiers:id,menu_id,type,name,extra_price',
            ])
            ->orderBy('name')
            ->get();

        $rawSession = $request->session()->get('order_session', []);
        $isDineIn = ($rawSession['mode'] ?? $rawSession['type'] ?? 'takeaway') === 'dine_in'
            && ! empty($rawSession['table_number']);

        $session = [
            'type' => $isDineIn ? 'dine_in' : 'takeaway',
            'mode' => $isDineIn ? 'dine_in' : 'takeaway',
            'table_number' => $isDineIn ? (string) $rawSession['table_number'] : null,
            'customer_name' => $rawSession['customer_name'] ?? $rawSession['name'] ?? null,
            'name' => $rawSession['name'] ?? $rawSession['customer_name'] ?? null,
            'phone' => $rawSession['phone'] ?? $rawSession['customer_phone'] ?? null,
            'customer_phone' => $rawSession['customer_phone'] ?? $rawSession['phone'] ?? null,
            'pickup_time' => $rawSession['pickup_time'] ?? $rawSession['pickup_at'] ?? $rawSession['pickupAt'] ?? null,
            'pickup_at' => $rawSession['pickup_at'] ?? $rawSession['pickup_time'] ?? null,
        ];

        if ($user = $request->user()) {
            $session['customer_name'] = $user->name;
            $session['name'] = $user->name;
            $session['phone'] = $user->phone;
            $session['customer_phone'] = $user->phone;
        }

        return Inertia::render('Cart', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'menus' => $menus,
            'orderSession' => $session,
            'defaultPromo' => [
                'code' => 'SKETCHKOPI',
                'discountPercent' => 10,
                'description' => 'Diskon 10% Kupon Sketsa Kafe',
            ],
        ]);
    }
}
