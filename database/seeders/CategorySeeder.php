<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Kopi Susu',
                'slug' => 'kopi-susu',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Manual Brew',
                'slug' => 'manual-brew',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Makanan Berat',
                'slug' => 'makanan-berat',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Camilan',
                'slug' => 'camilan',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Non-Kopi',
                'slug' => 'non-kopi',
                'sort_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
