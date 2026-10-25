<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuModifier;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private Menu $menu;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::create([
            'name' => 'Kopi Susu',
            'slug' => 'kopi-susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->menu = Menu::create([
            'category_id' => $category->id,
            'name' => 'Es Kopi Susu Aren',
            'price' => 20000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        MenuModifier::create([
            'menu_id' => $this->menu->id,
            'type' => 'susu',
            'name' => 'Oat Milk',
            'extra_price' => 6000,
        ]);

        MenuModifier::create([
            'menu_id' => $this->menu->id,
            'type' => 'topping',
            'name' => 'Grass Jelly',
            'extra_price' => 4000,
        ]);
    }

    public function test_guest_can_checkout_cashier_order_with_unpaid_status(): void
    {
        $payload = [
            'payment_method' => 'kasir',
            'session_type' => 'dine_in',
            'table_number' => '12',
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 2,
                    'temperature' => 'Dingin',
                    'sugarLevel' => 'Less Sugar (50%)',
                ],
            ],
        ];

        $response = $this->postJson('/order/checkout', $payload);

        $response->assertCreated();
        $response->assertJson([
            'success' => true,
            'order' => [
                'status' => Order::STATUS_UNPAID_CASHIER,
                'payment_method' => 'kasir',
                'subtotal' => 40000,
                'discount' => 0,
                'pb1_tax' => 4000,
                'total' => 44000,
                'table_number' => '12',
            ],
        ]);

        $this->assertDatabaseHas('orders', [
            'status' => 'unpaid_cashier',
            'table_number' => '12',
            'payment_method' => 'kasir',
            'total' => 44000,
        ]);

        $this->assertDatabaseHas('order_items', [
            'menu_name' => 'Es Kopi Susu Aren',
            'quantity' => 2,
            'unit_price' => 20000,
            'total_price' => 40000,
        ]);
    }

    public function test_guest_can_checkout_qris_order_with_confirmed_status(): void
    {
        $payload = [
            'payment_method' => 'qris',
            'session_type' => 'takeaway',
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081234567890',
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 1,
                    'milk' => ['name' => 'Oat Milk'],
                    'toppings' => [['name' => 'Grass Jelly']],
                ],
            ],
        ];

        // 20000 + 6000 + 4000 = 30000. PB1 10% = 3000. Total = 33000.
        $response = $this->postJson('/order/checkout', $payload);

        $response->assertCreated();
        $response->assertJson([
            'success' => true,
            'order' => [
                'status' => Order::STATUS_CONFIRMED,
                'payment_method' => 'qris',
                'subtotal' => 30000,
                'total' => 33000,
            ],
        ]);

        $this->assertDatabaseHas('orders', [
            'status' => 'confirmed',
            'payment_method' => 'qris',
            'customer_name' => 'Budi Santoso',
            'total' => 33000,
        ]);
    }

    public function test_server_recalculates_prices_preventing_client_tampering(): void
    {
        // Attacker attempts to forge price to Rp 100
        $payload = [
            'payment_method' => 'kasir',
            'session_type' => 'dine_in',
            'table_number' => '5',
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 1,
                    'unit_price' => 100,
                    'total_price' => 100,
                ],
            ],
        ];

        $response = $this->postJson('/order/checkout', $payload);

        $response->assertCreated();
        // Server ignores spoofed 100, applies real 20000 + 10% PB1 = 22000
        $response->assertJsonPath('order.subtotal', 20000);
        $response->assertJsonPath('order.pb1_tax', 2000);
        $response->assertJsonPath('order.total', 22000);
    }

    public function test_coupon_sketchkopi_applies_ten_percent_discount(): void
    {
        $payload = [
            'payment_method' => 'qris',
            'coupon_code' => 'SKETCHKOPI',
            'session_type' => 'dine_in',
            'table_number' => '8',
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 2, // 20000 * 2 = 40000
                ],
            ],
        ];

        // Subtotal: 40000. Diskon (10%): 4000. Taxable: 36000. PB1: 3600. Total: 39600.
        $response = $this->postJson('/order/checkout', $payload);

        $response->assertCreated();
        $response->assertJsonPath('order.subtotal', 40000);
        $response->assertJsonPath('order.discount', 4000);
        $response->assertJsonPath('order.pb1_tax', 3600);
        $response->assertJsonPath('order.total', 39600);
    }

    public function test_checkout_rejects_empty_items_or_invalid_payment_method(): void
    {
        $response = $this->postJson('/order/checkout', [
            'payment_method' => 'bitcoin',
            'items' => [],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['payment_method', 'items']);
    }

    public function test_takeaway_checkout_tolerates_integer_or_leftover_table_number(): void
    {
        $response = $this->postJson('/order/checkout', [
            'payment_method' => 'kasir',
            'session_type' => 'takeaway',
            'table_number' => 5, // Integer dari sesi sebelumnya
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081234567890',
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('orders', [
            'session_type' => 'takeaway',
            'table_number' => null, // Harus null karena mode takeaway
        ]);
    }

    public function test_dine_in_checkout_casts_integer_table_number_to_string(): void
    {
        $response = $this->postJson('/order/checkout', [
            'payment_method' => 'kasir',
            'session_type' => 'dine_in',
            'table_number' => 12, // Dikirim integer oleh browser
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('orders', [
            'session_type' => 'dine_in',
            'table_number' => '12',
        ]);
    }
}
