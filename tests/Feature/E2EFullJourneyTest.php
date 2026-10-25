<?php

namespace Tests\Feature;

use App\Filament\Resources\OrderResource\Pages\ListOrders;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuModifier;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class E2EFullJourneyTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_cafe_order_lifecycle_from_qr_scan_to_ready_and_history(): void
    {
        // 1. Setup Menu Catalog with Category and Modifiers
        $category = Category::create([
            'name' => 'Kopi Susu',
            'slug' => 'kopi-susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $menu = Menu::create([
            'category_id' => $category->id,
            'name' => 'Es Kopi Corat-Coret',
            'description' => 'Kopi susu gula aren andalan.',
            'price' => 20000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        $oatModifier = MenuModifier::create([
            'menu_id' => $menu->id,
            'type' => 'milk',
            'name' => 'Susu Oat',
            'extra_price' => 6000,
            'is_available' => true,
        ]);

        // 2. Scan QR Meja (RFC-003, F1, TC-003-1)
        $welcomeRes = $this->get('/?table=12');
        $welcomeRes->assertOk();
        $this->assertEquals(12, session('order_session.table_number'));
        $this->assertEquals('dine_in', session('order_session.mode'));

        // 3. Member Registration (RFC-008, F24, TC-008-1)
        $registerRes = $this->postJson('/member/register', [
            'name' => 'Rian Hidayat',
            'phone' => '081234567888',
            'pin' => '123456',
        ]);
        $registerRes->assertStatus(201);
        $this->assertAuthenticated();
        $memberUser = User::where('phone', '081234567888')->firstOrFail();

        // 4. Place Order with Modifier & Coupon SKETCHKOPI (RFC-005, RFC-006, F13, F16, F19)
        // Subtotal: (20000 + 6000) * 2 = 52000.
        // Discount: 10% = 5200.
        // Taxable: 46800. PB1: 4680. Total: 51480.
        $checkoutPayload = [
            'payment_method' => 'kasir',
            'coupon_code' => 'SKETCHKOPI',
            'session_type' => 'dine_in',
            'table_number' => '12',
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'quantity' => 2,
                    'temperature' => 'Dingin',
                    'sugarLevel' => 'Less Sugar (50%)',
                    'milk' => ['name' => 'Susu Oat', 'extra_price' => 6000],
                    'notes' => 'Tolong pisahkan sedotan kertas ya.',
                ],
            ],
        ];

        $checkoutRes = $this->postJson('/order/checkout', $checkoutPayload);
        $checkoutRes->assertStatus(201);
        $orderData = $checkoutRes->json('order');

        $this->assertEquals(Order::STATUS_UNPAID_CASHIER, $orderData['status']);
        $this->assertEquals(52000, $orderData['subtotal']);
        $this->assertEquals(5200, $orderData['discount']);
        $this->assertEquals(4680, $orderData['pb1_tax']);
        $this->assertEquals(51480, $orderData['total']);

        $order = Order::findOrFail($orderData['id']);
        $this->assertEquals($memberUser->id, $order->user_id);

        // 5. Customer Tracker Screen Access (RFC-007, F21, TC-007-2)
        $trackerRes = $this->get("/order/track/{$order->id}");
        $trackerRes->assertOk();

        // 6. Filament Admin Cashier Flow (RFC-007, F20, TC-007-1, TC-007-3)
        $admin = User::factory()->create();
        $this->actingAs($admin);

        // Kasir konfirmasi pembayaran lunas
        Livewire::test(ListOrders::class)
            ->callTableAction('confirm_payment', $order)
            ->assertHasNoTableActionErrors();
        $this->assertEquals(Order::STATUS_CONFIRMED, $order->fresh()->status);

        // Barista mulai racik pesanan
        Livewire::test(ListOrders::class)
            ->callTableAction('start_process', $order->fresh())
            ->assertHasNoTableActionErrors();
        $this->assertEquals(Order::STATUS_IN_PROGRESS, $order->fresh()->status);

        // Barista tandai pesanan siap diantar
        Livewire::test(ListOrders::class)
            ->callTableAction('mark_ready', $order->fresh())
            ->assertHasNoTableActionErrors();
        $this->assertEquals(Order::STATUS_READY, $order->fresh()->status);

        // 7. Customer Polls Real-Time Status
        $this->actingAs($memberUser);
        $pollRes = $this->getJson('/order/'.rawurlencode($order->order_code).'/status-poll');
        $pollRes->assertOk();
        $pollRes->assertJson([
            'success' => true,
            'status' => Order::STATUS_READY,
            'is_ready' => true,
        ]);

        // 8. Member Checks Order History (RFC-008, F24, TC-008-2)
        $historyRes = $this->getJson('/member/history');
        $historyRes->assertOk();
        $historyRes->assertJsonFragment([
            'order_code' => $order->order_code,
            'total' => 51480,
            'status' => Order::STATUS_READY,
        ]);
    }
}
