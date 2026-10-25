<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\OrderResource\Pages\ListOrders;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class OrderResourceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    private function createSampleOrder(array $attributes = []): Order
    {
        $category = Category::firstOrCreate(['slug' => 'kopi-susu'], [
            'name' => 'Kopi Susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $menu = Menu::firstOrCreate(['name' => 'Es Kopi Susu Aren'], [
            'category_id' => $category->id,
            'description' => 'Kopi susu aren.',
            'price' => 28000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        $order = Order::create(array_merge([
            'order_code' => '#ORD-'.rand(1000, 9999),
            'session_type' => 'dine_in',
            'table_number' => '12',
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081234567890',
            'payment_method' => Order::PAYMENT_CASHIER,
            'status' => Order::STATUS_UNPAID_CASHIER,
            'subtotal' => 28000,
            'discount' => 0,
            'pb1_tax' => 2800,
            'total' => 30800,
        ], $attributes));

        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $menu->id,
            'menu_name' => 'Es Kopi Susu Aren',
            'quantity' => 1,
            'unit_price' => 28000,
            'total_price' => 28000,
            'modifiers_summary' => 'Dingin • Normal Sugar',
        ]);

        return $order;
    }

    public function test_guest_cannot_access_orders_page(): void
    {
        $response = $this->get('/admin/orders');
        $response->assertRedirect('/admin/login');
    }

    public function test_admin_can_view_orders_table(): void
    {
        $order = $this->createSampleOrder();

        $this->actingAs($this->admin);

        Livewire::test(ListOrders::class)
            ->assertCanSeeTableRecords([$order])
            ->assertSee($order->order_code)
            ->assertSee('Meja 12');
    }

    public function test_cashier_can_confirm_payment_transitioning_status(): void
    {
        $order = $this->createSampleOrder(['status' => Order::STATUS_UNPAID_CASHIER]);

        $this->actingAs($this->admin);

        Livewire::test(ListOrders::class)
            ->callTableAction('confirm_payment', $order)
            ->assertHasNoTableActionErrors();

        $this->assertEquals(Order::STATUS_CONFIRMED, $order->fresh()->status);
    }

    public function test_barista_can_advance_order_to_in_progress_and_ready(): void
    {
        $order = $this->createSampleOrder(['status' => Order::STATUS_CONFIRMED]);

        $this->actingAs($this->admin);

        // Advance to in_progress
        Livewire::test(ListOrders::class)
            ->callTableAction('start_process', $order)
            ->assertHasNoTableActionErrors();

        $this->assertEquals(Order::STATUS_IN_PROGRESS, $order->fresh()->status);

        // Advance to ready
        Livewire::test(ListOrders::class)
            ->callTableAction('mark_ready', $order->fresh())
            ->assertHasNoTableActionErrors();

        $this->assertEquals(Order::STATUS_READY, $order->fresh()->status);
    }

    public function test_barista_can_complete_order(): void
    {
        $order = $this->createSampleOrder(['status' => Order::STATUS_READY]);

        $this->actingAs($this->admin);

        Livewire::test(ListOrders::class)
            ->callTableAction('complete', $order)
            ->assertHasNoTableActionErrors();

        $this->assertEquals(Order::STATUS_COMPLETED, $order->fresh()->status);
    }
}
