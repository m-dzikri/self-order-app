<?php

namespace Tests\Feature\Filament;

use App\Filament\Widgets\LatestOrdersWidget;
use App\Filament\Widgets\OrdersChartWidget;
use App\Filament\Widgets\StatsOverviewWidget;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/admin/login');
    }

    public function test_admin_can_view_dashboard_with_all_widgets(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin');
        $response->assertSuccessful();
    }

    public function test_customer_role_cannot_access_admin_dashboard(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $response = $this->actingAs($customer)->get('/admin');
        $response->assertForbidden();
    }

    public function test_stats_overview_widget_renders_correct_data(): void
    {
        // 1 confirmed order today
        Order::create([
            'order_code' => '#ORD-TEST-1',
            'session_type' => 'dine_in',
            'table_number' => '5',
            'customer_name' => 'Doni',
            'payment_method' => Order::PAYMENT_QRIS,
            'status' => Order::STATUS_CONFIRMED,
            'subtotal' => 50000,
            'discount' => 0,
            'pb1_tax' => 5000,
            'total' => 55000,
        ]);

        // 1 unpaid cashier order
        Order::create([
            'order_code' => '#ORD-TEST-2',
            'session_type' => 'takeaway',
            'customer_name' => 'Siti',
            'payment_method' => Order::PAYMENT_CASHIER,
            'status' => Order::STATUS_UNPAID_CASHIER,
            'subtotal' => 30000,
            'discount' => 0,
            'pb1_tax' => 3000,
            'total' => 33000,
        ]);

        // 1 out of stock menu
        $category = Category::create([
            'name' => 'Kopi',
            'slug' => 'kopi',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Menu::create([
            'category_id' => $category->id,
            'name' => 'Espresso Double',
            'description' => 'Double shot.',
            'price' => 20000,
            'is_active' => true,
            'is_in_stock' => false,
        ]);

        Livewire::actingAs($this->admin)
            ->test(StatsOverviewWidget::class)
            ->assertSuccessful()
            ->assertSee('Omzet Hari Ini')
            ->assertSee('Rp 55.000')
            ->assertSee('Antrean Aktif')
            ->assertSee('1 Pesanan')
            ->assertSee('Perlu Kasir')
            ->assertSee('Menu Habis');
    }

    public function test_orders_chart_widget_renders_successfully(): void
    {
        Livewire::actingAs($this->admin)
            ->test(OrdersChartWidget::class)
            ->assertSuccessful()
            ->assertSee('Tren Omzet 7 Hari Terakhir');
    }

    public function test_latest_orders_widget_renders_table(): void
    {
        Order::create([
            'order_code' => '#ORD-LATEST-1',
            'session_type' => 'dine_in',
            'table_number' => '7',
            'customer_name' => 'Rian',
            'payment_method' => Order::PAYMENT_QRIS,
            'status' => Order::STATUS_CONFIRMED,
            'subtotal' => 40000,
            'discount' => 0,
            'pb1_tax' => 4000,
            'total' => 44000,
        ]);

        Livewire::actingAs($this->admin)
            ->test(LatestOrdersWidget::class)
            ->assertSuccessful()
            ->assertCanRenderTableColumn('order_code')
            ->assertCanRenderTableColumn('customer_name')
            ->assertCanRenderTableColumn('total')
            ->assertCanRenderTableColumn('status');
    }
}
