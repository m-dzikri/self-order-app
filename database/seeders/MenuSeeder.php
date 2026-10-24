<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Katalog menu awal sesuai mock data prototipe desain-web
     * (02_katalog_menu & 03_kustomisasi_menu).
     */
    public function run(): void
    {
        $milkOptions = [
            ['type' => 'susu', 'name' => 'Susu Sapi Segar (Fresh Milk)', 'extra_price' => 0],
            ['type' => 'susu', 'name' => 'Oat Milk Barista Blend', 'extra_price' => 6000],
            ['type' => 'susu', 'name' => 'Almond Milk', 'extra_price' => 7000],
            ['type' => 'susu', 'name' => 'Soy Milk', 'extra_price' => 5000],
        ];

        $toppingOptions = [
            ['type' => 'topping', 'name' => 'Ekstra Espresso Shot', 'extra_price' => 5000],
            ['type' => 'topping', 'name' => 'Grass Jelly / Cincau Lembut', 'extra_price' => 4000],
            ['type' => 'topping', 'name' => 'Coffee Jelly Cubes', 'extra_price' => 4000],
        ];

        $menus = [
            [
                'category' => 'kopi-susu',
                'name' => 'Es Kopi Susu Aren',
                'description' => 'Kopi susu gula aren khas atelier, disajikan dingin dengan es batu kristal.',
                'price' => 22000,
                'badge' => 'favorit',
                'is_in_stock' => true,
                'modifiers' => array_merge($milkOptions, $toppingOptions),
            ],
            [
                'category' => 'kopi-susu',
                'name' => 'Caffe Latte Sketsa',
                'description' => 'Latte dengan busa susu lembut dan goresan latte art ala sketsa.',
                'price' => 26000,
                'badge' => null,
                'is_in_stock' => true,
                'modifiers' => $milkOptions,
            ],
            [
                'category' => 'manual-brew',
                'name' => 'V60 Flores Bajawa',
                'description' => 'Single origin Flores Bajawa, seduh manual dengan profil rasa cokelat dan kacang.',
                'price' => 30000,
                'badge' => 'spesial',
                'is_in_stock' => true,
                'modifiers' => [],
            ],
            [
                'category' => 'makanan-berat',
                'name' => 'Mie Goreng Corat-Coret',
                'description' => 'Mie goreng jawa dengan telur mata sapi dan taburan bawang goreng.',
                'price' => 28000,
                'badge' => 'favorit',
                'is_in_stock' => true,
                'modifiers' => [],
            ],
            [
                'category' => 'camilan',
                'name' => 'Croissant Almond',
                'description' => 'Croissant renyah berlapis isian almond manis.',
                'price' => 24000,
                'badge' => null,
                // Sesuai mock katalog: item ini ditandai "Habis".
                'is_in_stock' => false,
                'modifiers' => [],
            ],
            [
                'category' => 'camilan',
                'name' => 'Pisang Goreng Keju',
                'description' => 'Pisang goreng krispi dengan parutan keju dan madu.',
                'price' => 20000,
                'badge' => null,
                'is_in_stock' => true,
                'modifiers' => [],
            ],
        ];

        foreach ($menus as $menu) {
            $category = Category::where('slug', $menu['category'])->firstOrFail();

            $record = Menu::updateOrCreate(
                ['name' => $menu['name']],
                [
                    'category_id' => $category->id,
                    'description' => $menu['description'],
                    'price' => $menu['price'],
                    'badge' => $menu['badge'],
                    'is_active' => true,
                    'is_in_stock' => $menu['is_in_stock'],
                ]
            );

            $record->modifiers()->delete();

            foreach ($menu['modifiers'] as $modifier) {
                $record->modifiers()->create($modifier);
            }
        }
    }
}
