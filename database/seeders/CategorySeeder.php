<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Kategori menu sesuai daftar pada RFC-002 dan mock data kafe.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Kopi Susu', 'sort_order' => 1],
            ['name' => 'Manual Brew', 'sort_order' => 2],
            ['name' => 'Makanan Berat', 'sort_order' => 3],
            ['name' => 'Camilan', 'sort_order' => 4],
            ['name' => 'Non-Kopi', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'sort_order' => $category['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
