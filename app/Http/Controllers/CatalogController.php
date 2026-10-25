<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Display the public menu catalog with category filter and search (RFC-004).
     */
    public function __invoke(Request $request): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'sort_order']);

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
            'pickup_time' => $rawSession['pickup_time'] ?? $rawSession['pickup_at'] ?? null,
        ];

        if ($user = $request->user()) {
            $session['customer_name'] = $user->name;
            $session['name'] = $user->name;
            $session['phone'] = $user->phone;
            $session['customer_phone'] = $user->phone;
        }

        return Inertia::render('Catalog', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'categories' => $categories,
            'menus' => $menus,
            'orderSession' => $session,
        ]);
    }
}
