<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderSessionController extends Controller
{
    /**
     * Resolve the order session entry point (ARCH-4): a valid ?table=XX
     * query locks Dine-In mode; without it the visitor starts Takeaway.
     */
    public function __invoke(Request $request): Response
    {
        $table = $request->query('table');

        // QR meja selalu angka 1-3 digit; nilai tidak valid diabaikan (fallback takeaway).
        if (is_string($table) && preg_match('/^\d{1,3}$/', $table)) {
            $request->session()->put('order_session', array_merge(
                $request->session()->get('order_session', []),
                ['mode' => 'dine_in', 'table_number' => (int) $table],
            ));
        }

        $orderSession = $request->session()->get('order_session', []);

        return Inertia::render('Welcome', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'mode' => $orderSession['mode'] ?? 'takeaway',
            'tableNumber' => $orderSession['table_number'] ?? null,
            'orderSession' => [
                'name' => $orderSession['name'] ?? null,
                'phone' => $orderSession['phone'] ?? null,
                'pickupAt' => $orderSession['pickup_at'] ?? null,
            ],
        ]);
    }

    /**
     * Store the takeaway session data (F2/F23). Input is sanitized before
     * validation (SEC-1) and validated with the SEC-2 rules.
     */
    public function storeTakeaway(Request $request): RedirectResponse
    {
        $raw = $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'phone' => ['required', 'string'],
            'pickup_at' => ['required', 'string'],
        ], [
            'name.required' => 'Namanya diisi dulu ya.',
            'phone.required' => 'Nomor WhatsApp belum diisi.',
            'pickup_at.required' => 'Estimasi jam ambil belum dipilih.',
        ]);

        // Sanitasi: buang tag HTML sebelum validasi & penyimpanan (AC7, SEC-1).
        $name = trim(strip_tags($raw['name']));
        $phone = trim($raw['phone']);

        // Tulis balik nilai bersih agar validasi kedua membacanya, bukan input mentah.
        $request->merge(['name' => $name, 'phone' => $phone]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:60'],
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,11}$/'],
            'pickup_at' => [
                'required',
                'string',
                'date_format:H:i',
                function (string $attribute, mixed $value, $fail): void {
                    if (! is_string($value) || ! preg_match('/^\d{1,2}:\d{2}$/', $value)) {
                        return;
                    }

                    // Bandingkan pada resolusi menit agar "09:34" saat 09:34:15
                    // tidak dianggap lolos ke hari berikutnya.
                    $pickup = Carbon::today()->setTimeFromTimeString($value);

                    if ($pickup->lt(now()->startOfMinute())) {
                        $pickup->addDay();
                    }

                    if ($pickup->lt(now()->startOfMinute()->addMinutes(10))) {
                        $fail('Estimasi jam ambil minimal 10 menit dari sekarang.');
                    }
                },
            ],
        ], [
            'name.min' => 'Nama minimal 3 karakter.',
            'phone.regex' => 'Nomor WhatsApp harus diawali 08 (contoh: 081234567890).',
        ]);

        $order = array_merge($request->session()->get('order_session', []), [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'pickup_at' => $validated['pickup_at'],
        ]);

        // Sesi Dine-In terkunci (ARCH-4): pengajuan takeaway tidak mengubahnya.
        if (($order['mode'] ?? null) !== 'dine_in') {
            $order['mode'] = 'takeaway';
        }

        $request->session()->put('order_session', $order);

        return redirect()->route('welcome');
    }
}
