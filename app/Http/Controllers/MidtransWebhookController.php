<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    /**
     * Handle incoming payment notification webhook from Midtrans.
     */
    public function handle(Request $request, MidtransService $midtrans): JsonResponse
    {
        $payload = $request->all();

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');
        $transactionStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? '');
        $paymentType = (string) ($payload['payment_type'] ?? 'qris');

        if (empty($orderId) || empty($statusCode) || empty($grossAmount) || empty($signatureKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Payload webhook tidak lengkap.',
            ], 400);
        }

        // Verifikasi Signature Hash keamanan Midtrans (SHA512)
        if (! $midtrans->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            Log::warning("Midtrans Webhook: Signature tidak valid untuk pesanan {$orderId}");

            return response()->json([
                'success' => false,
                'message' => 'Signature key tidak valid.',
            ], 403);
        }

        $order = Order::where('order_code', $orderId)
            ->orWhere('order_code', '#'.$orderId)
            ->orWhere('order_code', ltrim($orderId, '#'))
            ->first();

        if (! $order) {
            Log::warning("Midtrans Webhook: Pesanan {$orderId} tidak ditemukan di database.");

            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        Log::info("Midtrans Webhook: Pesanan {$orderId} status: {$transactionStatus}, tipe: {$paymentType}");

        if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
            $order->update([
                'status' => Order::STATUS_CONFIRMED,
                'payment_gateway_status' => 'settlement',
                'payment_type' => $paymentType,
                'paid_at' => now(),
            ]);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'], true)) {
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'payment_gateway_status' => $transactionStatus,
            ]);
        } elseif ($transactionStatus === 'pending') {
            $order->update([
                'payment_gateway_status' => 'pending',
                'payment_type' => $paymentType,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi Midtrans berhasil diproses.',
            'order_code' => $order->order_code,
            'status' => $order->status,
        ]);
    }
}
