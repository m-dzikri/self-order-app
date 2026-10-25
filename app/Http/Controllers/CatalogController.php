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

        $session = $request->session()->get('order_session', [
            'type' => 'takeaway',
            'table_number' => null,
            'customer_name' => null,
            'phone' => null,
            'pickup_time' => null,
        ]);

        return Inertia::render('Catalog', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'categories' => $categories,
            'menus' => $menus,
            'orderSession' => $session,
        ]);
    }
}
