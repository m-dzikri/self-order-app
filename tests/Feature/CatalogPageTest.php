<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use Database\Seeders\CategorySeeder;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_endpoint_renders_inertia_with_categories_and_menus(): void
    {
        $this->seed(CategorySeeder::class);
        $this->seed(MenuSeeder::class);

        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Catalog')
            ->has('categories', 5)
            ->has('menus', 6)
            ->has('orderSession')
        );
    }

    public function test_catalog_does_not_display_inactive_menus(): void
    {
        $category = Category::create([
            'name' => 'Kopi',
            'slug' => 'kopi',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Menu::create([
            'category_id' => $category->id,
            'name' => 'Kopi Rahasia',
            'price' => 20000,
            'is_active' => false,
            'is_in_stock' => true,
        ]);

        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Catalog')
            ->has('menus', 0)
        );
    }

    public function test_catalog_reflects_active_dine_in_table_session(): void
    {
        $this->withSession([
            'order_session' => [
                'type' => 'dine_in',
                'table_number' => '12',
            ],
        ]);

        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Catalog')
            ->where('orderSession.type', 'dine_in')
            ->where('orderSession.table_number', '12')
        );
    }

    public function test_catalog_bundle_contains_customizer_and_category_elements(): void
    {
        $response = $this->get('/katalog');
        $response->assertOk();

        // Check that manifest and compiled bundle exist
        $manifestPath = public_path('build/manifest.json');
        $this->assertFileExists($manifestPath);

        $manifest = json_decode(file_get_contents($manifestPath), true);
        $this->assertArrayHasKey('resources/js/Pages/Catalog.jsx', $manifest);

        $bundleFile = public_path('build/'.$manifest['resources/js/Pages/Catalog.jsx']['file']);
        $this->assertFileExists($bundleFile);

        $bundleContent = file_get_contents($bundleFile);
        $this->assertStringContainsString('Kategori Sketsa', $bundleContent);
        $this->assertStringContainsString('sketchbook_cart', $bundleContent);

        // CustomizerDrawer may be inline or code-split into a shared chunk
        $customizerFound = str_contains($bundleContent, 'Pilihan Suhu');
        if (! $customizerFound && isset($manifest['resources/js/Pages/Catalog.jsx']['imports'])) {
            foreach ($manifest['resources/js/Pages/Catalog.jsx']['imports'] as $importKey) {
                if (isset($manifest[$importKey]['file'])) {
                    $chunkContent = file_get_contents(public_path('build/'.$manifest[$importKey]['file']));
                    if (str_contains($chunkContent, 'Pilihan Suhu')) {
                        $customizerFound = true;
                        break;
                    }
                }
            }
        }
        $this->assertTrue($customizerFound, 'Customizer drawer content with "Pilihan Suhu" was not found in catalog bundle or its chunk imports.');
    }
}
