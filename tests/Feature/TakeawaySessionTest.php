<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TakeawaySessionTest extends TestCase
{
    use WithFaker;

    /** Estimasi jam ambil yang sah: 30 menit dari sekarang. */
    private function validPickupAt(): string
    {
        return now()->addMinutes(30)->format('H:i');
    }

    public function test_valid_takeaway_submission_stores_session(): void
    {
        $this->post('/session/takeaway', [
            'name' => 'Sasa Putri',
            'phone' => '081234567890',
            'pickup_at' => $this->validPickupAt(),
        ])->assertRedirect(route('welcome'));

        $session = session('order_session');

        $this->assertSame('takeaway', $session['mode']);
        $this->assertSame('Sasa Putri', $session['name']);
        $this->assertSame('081234567890', $session['phone']);
        $this->assertNotNull($session['pickup_at']);
    }

    public function test_short_name_is_rejected(): void
    {
        $this->from('/')
            ->post('/session/takeaway', [
                'name' => 'Sa',
                'phone' => '081234567890',
                'pickup_at' => $this->validPickupAt(),
            ])
            ->assertRedirect('/')
            ->assertSessionHasErrors('name');

        $this->assertNull(session('order_session'));
    }

    public function test_invalid_whatsapp_numbers_are_rejected(): void
    {
        foreach (['08123', '1234567890', '081234567890123', '+6281234567890'] as $phone) {
            $this->post('/session/takeaway', [
                'name' => 'Sasa Putri',
                'phone' => $phone,
                'pickup_at' => $this->validPickupAt(),
            ])->assertSessionHasErrors('phone');
        }
    }

    public function test_pickup_within_ten_minutes_is_rejected(): void
    {
        $this->post('/session/takeaway', [
            'name' => 'Sasa Putri',
            'phone' => '081234567890',
            'pickup_at' => now()->addMinutes(5)->format('H:i'),
        ])->assertSessionHasErrors('pickup_at');

        $this->post('/session/takeaway', [
            'name' => 'Sasa Putri',
            'phone' => '081234567890',
            'pickup_at' => now()->format('H:i'),
        ])->assertSessionHasErrors('pickup_at');
    }

    public function test_missing_fields_are_rejected(): void
    {
        $this->post('/session/takeaway', [])->assertSessionHasErrors(['name', 'phone', 'pickup_at']);
    }

    public function test_html_in_name_is_stripped_before_storing(): void
    {
        // AC7 / SEC-1: sanitasi input pengguna.
        $this->post('/session/takeaway', [
            'name' => '<b>Sasa</b> Putri',
            'phone' => '081234567890',
            'pickup_at' => $this->validPickupAt(),
        ])->assertRedirect(route('welcome'));

        $session = session('order_session');

        $this->assertSame('Sasa Putri', $session['name']);
        $this->assertStringNotContainsString('<', $session['name']);
    }

    public function test_takeaway_submission_does_not_overwrite_dine_in_session(): void
    {
        // ARCH-4: sesi dine-in terkunci; pengajuan takeaway tidak mengubah mode/meja.
        $this->withSession(['order_session' => ['mode' => 'dine_in', 'table_number' => 5]])
            ->post('/session/takeaway', [
                'name' => 'Sasa Putri',
                'phone' => '081234567890',
                'pickup_at' => $this->validPickupAt(),
            ])
            ->assertRedirect(route('welcome'));

        $session = session('order_session');

        $this->assertSame('dine_in', $session['mode']);
        $this->assertSame(5, $session['table_number']);
        $this->assertSame('Sasa Putri', $session['name'], 'Data takeaway tetap tersimpan untuk ditampilkan.');
    }

    public function test_stored_session_is_exposed_back_to_welcome_page(): void
    {
        $this->withSession(['order_session' => [
            'mode' => 'takeaway',
            'name' => 'Sasa Putri',
            'phone' => '081234567890',
            'pickup_at' => '14:30',
        ]])
            ->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Welcome')
                ->where('mode', 'takeaway')
                ->where('orderSession.name', 'Sasa Putri')
                ->where('orderSession.phone', '081234567890')
                ->where('orderSession.pickupAt', '14:30')
            );
    }
}
