<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class StoreTakeawayRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Sesi takeaway publik: siapa pun boleh mengisi (F23 guest checkout).
        return true;
    }

    /**
     * Sanitasi sebelum validasi (SEC-1/AC7): buang tag HTML dan trim.
     */
    public function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->input('name')) ? trim(strip_tags($this->input('name'))) : $this->input('name'),
            'phone' => is_string($this->input('phone')) ? trim($this->input('phone')) : $this->input('phone'),
        ]);
    }

    /**
     * Aturan validasi SEC-2: nama >= 3 karakter, WA format Indonesia,
     * estimasi jam ambil minimal 10 menit ke depan.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
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
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Namanya diisi dulu ya.',
            'name.min' => 'Nama minimal 3 karakter.',
            'phone.required' => 'Nomor WhatsApp belum diisi.',
            'phone.regex' => 'Nomor WhatsApp harus diawali 08 (contoh: 081234567890).',
            'pickup_at.required' => 'Estimasi jam ambil belum dipilih.',
        ];
    }
}
