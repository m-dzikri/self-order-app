<?php

namespace Tests\Feature;

use Database\Seeders\CategorySeeder;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_endpoint_renders_inertia_component_cart(): void
    {
        $this->seed(CategorySeeder::class);
        $this->seed(MenuSeeder::class);

        $response = $this->get('/keranjang');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Cart')
            ->has('menus', 6)
            ->has('orderSession')
            ->has('defaultPromo')
            ->where('defaultPromo.code', 'SKETCHKOPI')
        );
    }

    public function test_cart_reflects_active_dine_in_table_session(): void
    {
        $this->withSession([
            'order_session' => [
                'type' => 'dine_in',
                'table_number' => '12',
            ],
        ]);

        $response = $this->get('/keranjang');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Cart')
            ->where('orderSession.type', 'dine_in')
            ->where('orderSession.table_number', '12')
        );
    }

    public function test_cart_reflects_takeaway_session(): void
    {
        $this->withSession([
            'order_session' => [
                'type' => 'takeaway',
                'table_number' => null,
                'customer_name' => 'Budi Santoso',
                'phone' => '081234567890',
            ],
        ]);

        $response = $this->get('/keranjang');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Cart')
            ->where('orderSession.type', 'takeaway')
            ->where('orderSession.customer_name', 'Budi Santoso')
        );
    }

    public function test_cart_bundle_contains_receipt_and_coupon_elements(): void
    {
        $response = $this->get('/keranjang');
        $response->assertOk();

        $manifestPath = public_path('build/manifest.json');
        if (! file_exists($manifestPath)) {
            $this->markTestSkipped('Vite manifest not generated yet.');
        }

        $manifest = json_decode(file_get_contents($manifestPath), true);
        if (! isset($manifest['resources/js/Pages/Cart.jsx'])) {
            $this->markTestSkipped('Cart.jsx chunk not yet in build manifest.');
        }

        $bundleFile = public_path('build/'.$manifest['resources/js/Pages/Cart.jsx']['file']);
        $this->assertFileExists($bundleFile);

        $bundleContent = file_get_contents($bundleFile);
        $this->assertStringContainsString('NOTA SEMENTARA', $bundleContent);
        $this->assertStringContainsString('SKETCHKOPI', $bundleContent);
        $this->assertStringContainsString('sketchbook_cart', $bundleContent);
    }
}
