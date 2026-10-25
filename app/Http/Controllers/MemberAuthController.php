<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class MemberAuthController extends Controller
{
    /**
     * Register a new cafe member (RFC-008, F24, TC-008-1, SEC-2).
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:100',
            'phone' => 'required|string|regex:/^08[0-9]{8,11}$/|unique:users,phone',
            'pin' => 'required|string|regex:/^[0-9]{6}$/',
        ], [
            'name.min' => 'Nama member minimal 3 karakter.',
            'phone.regex' => 'Format nomor WhatsApp harus diawali 08 (10–13 angka).',
            'phone.unique' => 'Nomor WhatsApp ini sudah terdaftar sebagai member.',
            'pin.regex' => 'PIN harus terdiri dari persis 6 digit angka.',
        ]);

        $cleanName = strip_tags(trim($validated['name']));
        $cleanPhone = trim($validated['phone']);

        $user = User::create([
            'name' => $cleanName,
            'phone' => $cleanPhone,
            'email' => $cleanPhone.'@member.kopicoratcoret.com',
            'password' => Hash::make($validated['pin']),
            'role' => 'customer',
        ]);

        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => "Selamat bergabung, {$cleanName}! Akun member Kopi Corat-Coret kamu sudah aktif. ✨",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ], 201);
    }

    /**
     * Authenticate cafe member using WhatsApp number and 6-digit PIN (RFC-008, F24, TC-008-1).
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'pin' => 'required|string|regex:/^[0-9]{6}$/',
        ], [
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'pin.regex' => 'PIN harus berupa 6 angka.',
        ]);

        $phone = trim($validated['phone']);
        $user = User::where('phone', $phone)->first();

        if (! $user || ! Hash::check($validated['pin'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor WhatsApp atau PIN 6 angka tidak cocok. Silakan coba lagi.',
            ], 422);
        }

        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => "Selamat datang kembali, {$user->name}! ☕",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Log the cafe member out and invalidate session.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Kamu telah keluar dari akun member. Sampai jumpa lagi!',
        ]);
    }

    /**
     * Retrieve order history for the authenticated member (RFC-008, F24, TC-008-2, SEC-3).
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan masuk untuk melihat riwayat pesanan.',
            ], 401);
        }

        $orders = Order::where(function ($query) use ($user) {
            $query->where('user_id', $user->id);
            if ($user->phone) {
                $query->orWhere('customer_phone', $user->phone);
            }
        })
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ],
            'orders' => $orders->map(fn (Order $o) => [
                'id' => $o->id,
                'order_code' => $o->order_code,
                'session_type' => $o->session_type,
                'table_number' => $o->table_number,
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'total' => $o->total,
                'created_at' => $o->created_at->toISOString(),
                'formatted_date' => $o->created_at->translatedFormat('d M Y, H:i'),
                'items_count' => $o->items->sum('quantity'),
                'items' => $o->items->map(fn ($item) => [
                    'id' => $item->id,
                    'menu_name' => $item->menu_name,
                    'quantity' => $item->quantity,
                    'total_price' => $item->total_price,
                    'modifiers_summary' => $item->modifiers_summary,
                ]),
            ]),
        ]);
    }
}
