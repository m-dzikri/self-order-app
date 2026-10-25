<?php

namespace Database\Seeders;

use App\Enums\BadgeEnum;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuModifier;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $kopiSusu = Category::where('slug', 'kopi-susu')->first();
        $manualBrew = Category::where('slug', 'manual-brew')->first();
        $makanan = Category::where('slug', 'makanan-berat')->first();
        $camilan = Category::where('slug', 'camilan')->first();
        $nonKopi = Category::where('slug', 'non-kopi')->first();

        $menus = [
            [
                'category_id' => $kopiSusu?->id,
                'name' => 'Kopi Susu Senja',
                'description' => 'Espresso house blend dengan susu segar dan sentuhan sirup karamel bakar.',
                'price' => 22000,
                'badge' => BadgeEnum::FAVORIT->value,
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [
                    ['type' => 'susu', 'name' => 'Fresh Milk', 'extra_price' => 0],
                    ['type' => 'susu', 'name' => 'Oat Milk', 'extra_price' => 6000],
                    ['type' => 'susu', 'name' => 'Almond Milk', 'extra_price' => 8000],
                    ['type' => 'topping', 'name' => 'Extra Espresso Shot', 'extra_price' => 5000],
                    ['type' => 'topping', 'name' => 'Grass Jelly', 'extra_price' => 4000],
                ],
            ],
            [
                'category_id' => $manualBrew?->id,
                'name' => 'V60 Flores Bajawa',
                'description' => 'Single origin Flores Bajawa dengan citarasa chocolatey, citrus hints, and nutty finish.',
                'price' => 28000,
                'badge' => BadgeEnum::SPESIAL->value,
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [],
            ],
            [
                'category_id' => $makanan?->id,
                'name' => 'Nasi Goreng Corat-Coret',
                'description' => 'Nasi goreng bumbu rempah khas dengan suwiran ayam kampung, telur ceplok setengah matang, dan kerupuk udang.',
                'price' => 32000,
                'badge' => BadgeEnum::FAVORIT->value,
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [
                    ['type' => 'topping', 'name' => 'Ekstra Telur Ceplok', 'extra_price' => 5000],
                    ['type' => 'topping', 'name' => 'Sosis Sapi Panggang', 'extra_price' => 7000],
                ],
            ],
            [
                'category_id' => $camilan?->id,
                'name' => 'Croissant Almond',
                'description' => 'Pastry renyah berlapis dengan isian krim almond manis dan taburan almond panggang.',
                'price' => 25000,
                'badge' => null,
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [],
            ],
            [
                'category_id' => $camilan?->id,
                'name' => 'Pisang Goreng Wijen',
                'description' => 'Pisang kepok manis digoreng tepung wijen renyah, disajikan dengan cocolan saus karamel.',
                'price' => 18000,
                'badge' => null,
                'is_active' => true,
                'is_in_stock' => false,
                'modifiers' => [
                    ['type' => 'topping', 'name' => 'Ekstra Saus Karamel', 'extra_price' => 3000],
                ],
            ],
            [
                'category_id' => $nonKopi?->id,
                'name' => 'Matcha Latte Kyoto',
                'description' => 'Bubuk matcha murni dari Uji, Kyoto berpadu lembut dengan susu segar steamed.',
                'price' => 26000,
                'badge' => null,
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [
                    ['type' => 'susu', 'name' => 'Fresh Milk', 'extra_price' => 0],
                    ['type' => 'susu', 'name' => 'Oat Milk', 'extra_price' => 6000],
                    ['type' => 'topping', 'name' => 'Matcha Ice Cream Scoop', 'extra_price' => 8000],
                ],
            ],
        ];

        foreach ($menus as $menuData) {
            $modifiers = $menuData['modifiers'] ?? [];
            unset($menuData['modifiers']);

            $menu = Menu::query()->updateOrCreate(
                ['name' => $menuData['name']],
                $menuData
            );

            $menu->modifiers()->delete();

            foreach ($modifiers as $modifier) {
                MenuModifier::query()->create([
                    'menu_id' => $menu->id,
                    'type' => $modifier['type'],
                    'name' => $modifier['name'],
                    'extra_price' => $modifier['extra_price'],
                ]);
            }
        }
    }
}
