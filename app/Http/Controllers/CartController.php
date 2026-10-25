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

        $session = $request->session()->get('order_session', [
            'type' => 'takeaway',
            'table_number' => null,
            'customer_name' => null,
            'phone' => null,
            'pickup_time' => null,
        ]);

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
