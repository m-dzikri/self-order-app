<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MidtransPaymentTest extends TestCase
{
    use RefreshDatabase;

    private Menu $menu;

    private MidtransService $midtrans;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::create([
            'name' => 'Kopi',
            'slug' => 'kopi',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->menu = Menu::create([
            'category_id' => $category->id,
            'name' => 'Kopi Susu Aren',
            'price' => 20000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        $this->midtrans = app(MidtransService::class);
    }

    public function test_qris_checkout_generates_snap_token(): void
    {
        $payload = [
            'payment_method' => 'qris',
            'session_type' => 'dine_in',
            'table_number' => '4',
            'customer_name' => 'Adit',
            'customer_phone' => '081234567890',
            'items' => [
                [
                    'menuId' => $this->menu->id,
                    'quantity' => 1,
                ],
            ],
        ];

        $response = $this->postJson('/order/checkout', $payload);

        $response->assertCreated();
        $response->assertJsonStructure([
            'success',
            'order' => [
                'id',
                'order_code',
                'status',
                'payment_method',
                'snap_token',
                'total',
            ],
        ]);

        $snapToken = $response->json('order.snap_token');
        $this->assertNotEmpty($snapToken);
        $this->assertFalse(str_starts_with($snapToken, 'MOCK_SNAP_'));

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Adit',
            'payment_method' => 'qris',
            'snap_token' => $snapToken,
        ]);
    }

    public function test_midtrans_webhook_requires_valid_signature(): void
    {
        $order = Order::create([
            'order_code' => '#ORD-MIDTRANS-1',
            'session_type' => 'dine_in',
            'payment_method' => 'qris',
            'status' => Order::STATUS_CONFIRMED,
            'subtotal' => 20000,
            'discount' => 0,
            'pb1_tax' => 2000,
            'total' => 22000,
        ]);

        $payload = [
            'order_id' => $order->order_code,
            'status_code' => '200',
            'gross_amount' => '22000.00',
            'signature_key' => 'invalid_forged_signature_hash',
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ];

        $response = $this->postJson('/api/webhooks/midtrans', $payload);
        $response->assertForbidden();
    }

    public function test_midtrans_webhook_settlement_marks_order_as_confirmed_and_paid(): void
    {
        $order = Order::create([
            'order_code' => '#ORD-MIDTRANS-2',
            'session_type' => 'takeaway',
            'customer_name' => 'Citra',
            'payment_method' => 'qris',
            'status' => Order::STATUS_CONFIRMED,
            'subtotal' => 40000,
            'discount' => 0,
            'pb1_tax' => 4000,
            'total' => 44000,
        ]);

        $statusCode = '200';
        $grossAmount = '44000.00';
        $signature = $this->midtrans->generateSignature($order->order_code, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $order->order_code,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ];

        $response = $this->postJson('/api/webhooks/midtrans', $payload);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'order_code' => $order->order_code,
            'status' => Order::STATUS_CONFIRMED,
        ]);

        $order->refresh();
        $this->assertEquals(Order::STATUS_CONFIRMED, $order->status);
        $this->assertEquals('settlement', $order->payment_gateway_status);
        $this->assertEquals('qris', $order->payment_type);
        $this->assertNotNull($order->paid_at);
    }

    public function test_midtrans_webhook_expire_cancels_order(): void
    {
        $order = Order::create([
            'order_code' => '#ORD-MIDTRANS-3',
            'session_type' => 'dine_in',
            'payment_method' => 'qris',
            'status' => Order::STATUS_CONFIRMED,
            'subtotal' => 20000,
            'discount' => 0,
            'pb1_tax' => 2000,
            'total' => 22000,
        ]);

        $statusCode = '200';
        $grossAmount = '22000.00';
        $signature = $this->midtrans->generateSignature($order->order_code, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $order->order_code,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'expire',
            'payment_type' => 'qris',
        ];

        $response = $this->postJson('/api/webhooks/midtrans', $payload);

        $response->assertOk();

        $order->refresh();
        $this->assertEquals(Order::STATUS_CANCELLED, $order->status);
        $this->assertEquals('expire', $order->payment_gateway_status);
    }

    public function test_midtrans_webhook_returns_404_for_unknown_order(): void
    {
        $statusCode = '200';
        $grossAmount = '50000.00';
        $orderCode = '#UNKNOWN-ORDER-999';
        $signature = $this->midtrans->generateSignature($orderCode, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderCode,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ];

        $response = $this->postJson('/api/webhooks/midtrans', $payload);
        $response->assertNotFound();
    }
}
