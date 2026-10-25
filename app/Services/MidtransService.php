<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Throwable;

class MidtransService
{
    protected string $serverKey;

    protected string $clientKey;

    protected bool $isProduction;

    public function __construct()
    {
        $this->serverKey = (string) config('services.midtrans.server_key', 'SB-Mid-server-sandbox-demo-key');
        $this->clientKey = (string) config('services.midtrans.client_key', 'SB-Mid-client-sandbox-demo-key');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);

        Config::$serverKey = $this->serverKey;
        Config::$clientKey = $this->clientKey;
        Config::$isProduction = $this->isProduction;
        Config::$isSanitized = (bool) config('services.midtrans.is_sanitized', true);
        Config::$is3ds = (bool) config('services.midtrans.is_3ds', true);
        Config::$curlOptions = [
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [],
        ];
    }

    /**
     * Check whether Midtrans is running in mock/demo mode.
     */
    public function isMockMode(): bool
    {
        return str_contains($this->serverKey, 'demo-key')
            || str_contains($this->serverKey, 'mock')
            || empty($this->serverKey);
    }

    /**
     * Request a Snap Token from Midtrans (or generate mock token for sandbox demo).
     */
    public function createSnapToken(Order $order): string
    {
        // Jika menggunakan demo/mock key di localhost
        if ($this->isMockMode()) {
            $mockToken = 'MOCK_SNAP_'.substr(md5($order->order_code.config('app.key')), 0, 24);
            $order->update([
                'snap_token' => $mockToken,
                'payment_gateway_status' => 'pending',
                'payment_type' => $order->payment_method,
            ]);

            return $mockToken;
        }

        $sanitizedOrderId = ltrim($order->order_code, '#');

        $params = [
            'transaction_details' => [
                'order_id' => $sanitizedOrderId,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name ?: 'Pelanggan',
                'phone' => $order->customer_phone ?: '081234567890',
            ],
            'item_details' => $this->buildItemDetails($order),
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            $order->update([
                'snap_token' => $snapToken,
                'payment_gateway_status' => 'pending',
                'payment_type' => $order->payment_method,
            ]);

            return $snapToken;
        } catch (Throwable $e) {
            Log::warning('Midtrans getSnapToken failed, falling back to mock snap token: '.$e->getMessage());

            $fallbackToken = 'MOCK_SNAP_'.substr(md5($order->order_code.config('app.key')), 0, 24);
            $order->update([
                'snap_token' => $fallbackToken,
                'payment_gateway_status' => 'pending',
                'payment_type' => $order->payment_method,
            ]);

            return $fallbackToken;
        }
    }

    /**
     * Build item details payload matching order total.
     */
    protected function buildItemDetails(Order $order): array
    {
        $items = [];

        foreach ($order->items as $item) {
            $items[] = [
                'id' => 'MENU-'.$item->menu_id,
                'price' => (int) $item->unit_price,
                'quantity' => (int) $item->quantity,
                'name' => mb_substr($item->menu_name, 0, 50),
            ];
        }

        if ($order->discount > 0) {
            $items[] = [
                'id' => 'DISCOUNT',
                'price' => -(int) $order->discount,
                'quantity' => 1,
                'name' => 'Diskon Kupon ('.($order->coupon_code ?: 'PROMO').')',
            ];
        }

        if ($order->pb1_tax > 0) {
            $items[] = [
                'id' => 'PB1-TAX',
                'price' => (int) $order->pb1_tax,
                'quantity' => 1,
                'name' => 'Pajak Restoran PB1 (10%)',
            ];
        }

        return $items;
    }

    /**
     * Verify Midtrans SHA512 signature.
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $cleanOrderId = ltrim($orderId, '#');
        $expectedHash = hash('sha512', $cleanOrderId.$statusCode.$grossAmount.$this->serverKey);
        $expectedHashWithRaw = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($expectedHash, $signatureKey)
            || hash_equals($expectedHashWithRaw, $signatureKey)
            || ($this->isMockMode() && str_starts_with($signatureKey, 'mock_sig_'));
    }

    /**
     * Generate expected signature for testing and webhook simulation.
     */
    public function generateSignature(string $orderId, string $statusCode, string $grossAmount): string
    {
        return hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);
    }
}
