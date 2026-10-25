<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderTrackerTest extends TestCase
{
    use RefreshDatabase;

    private function createSampleOrder(array $attributes = []): Order
    {
        $category = Category::firstOrCreate(['slug' => 'kopi-susu'], [
            'name' => 'Kopi Susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $menu = Menu::firstOrCreate(['name' => 'Kopi Tubruk'], [
            'category_id' => $category->id,
            'description' => 'Kopi tubruk nikmat.',
            'price' => 24000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        $order = Order::create(array_merge([
            'order_code' => '#ORD-'.rand(1000, 9999),
            'session_type' => 'dine_in',
            'table_number' => '12',
            'customer_name' => 'Siti Rahma',
            'customer_phone' => '081234567891',
            'payment_method' => Order::PAYMENT_QRIS,
            'status' => Order::STATUS_CONFIRMED,
            'subtotal' => 24000,
            'discount' => 0,
            'pb1_tax' => 2400,
            'total' => 26400,
        ], $attributes));

        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $menu->id,
            'menu_name' => 'Kopi Tubruk',
            'quantity' => 1,
            'unit_price' => 24000,
            'total_price' => 24000,
            'modifiers_summary' => 'Panas • Less Sugar',
        ]);

        return $order;
    }

    public function test_customer_can_view_tracker_page_for_their_order(): void
    {
        $order = $this->createSampleOrder();

        $response = $this->withSession([
            'active_order_ids' => [$order->id],
        ])->get("/order/track/{$order->id}");

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Tracker')
            ->has('order')
            ->where('order.id', $order->id)
            ->where('order.order_code', $order->order_code)
            ->where('order.status', Order::STATUS_CONFIRMED)
        );
    }

    public function test_unauthorized_customer_cannot_view_other_order(): void
    {
        $order = $this->createSampleOrder();

        // Guest with empty or different session
        $response = $this->withSession([
            'active_order_ids' => [9999],
        ])->get("/order/track/{$order->id}");

        $response->assertForbidden();
    }

    public function test_customer_can_view_tracker_by_order_code(): void
    {
        $order = $this->createSampleOrder();

        $response = $this->withSession([
            'active_order_ids' => [$order->id],
        ])->get('/order/track/'.rawurlencode($order->order_code));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Tracker')
            ->where('order.order_code', $order->order_code)
        );
    }

    public function test_order_status_polling_returns_current_status(): void
    {
        $order = $this->createSampleOrder(['status' => Order::STATUS_CONFIRMED]);

        $response = $this->withSession([
            'active_order_ids' => [$order->id],
        ])->getJson('/order/'.rawurlencode($order->order_code).'/status-poll');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'order_code' => $order->order_code,
            'status' => Order::STATUS_CONFIRMED,
            'is_ready' => false,
            'is_completed' => false,
        ]);
    }

    public function test_demo_status_simulation_advances_order_status(): void
    {
        $order = $this->createSampleOrder(['status' => Order::STATUS_CONFIRMED]);

        $response = $this->withSession([
            'active_order_ids' => [$order->id],
        ])->postJson('/order/'.rawurlencode($order->order_code).'/simulate-status', [
            'status' => Order::STATUS_IN_PROGRESS,
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'status' => Order::STATUS_IN_PROGRESS,
        ]);

        $this->assertEquals(Order::STATUS_IN_PROGRESS, $order->fresh()->status);
    }

    public function test_call_server_endpoint_returns_friendly_message(): void
    {
        $order = $this->createSampleOrder([
            'session_type' => 'dine_in',
            'table_number' => '12',
        ]);

        $response = $this->withSession([
            'active_order_ids' => [$order->id],
        ])->postJson('/order/'.rawurlencode($order->order_code).'/call-server');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertSee('Meja 12');
    }
}
