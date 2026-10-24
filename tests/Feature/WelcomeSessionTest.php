<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WelcomeSessionTest extends TestCase
{
    public function test_table_qr_locks_dine_in_mode_with_table_number(): void
    {
        // TC-003-1: ?table=12 mengunci mode dine-in.
        $this->withoutVite()
            ->get('/?table=12')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'dine_in')
                ->where('tableNumber', 12)
            );

        $this->assertSame(
            ['mode' => 'dine_in', 'table_number' => 12],
            session('order_session')
        );
    }

    public function test_missing_table_param_starts_takeaway_mode(): void
    {
        $this->withoutVite()
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'takeaway')
                ->where('tableNumber', null)
            );
    }

    public function test_non_numeric_table_param_is_ignored(): void
    {
        // Deviasi tercatat: QR sah selalu angka; nilai lain diabaikan.
        $this->withoutVite()
            ->get('/?table=abc')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'takeaway')
            );
    }

    public function test_overlong_table_param_is_ignored(): void
    {
        $this->withoutVite()
            ->get('/?table=1234')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'takeaway')
            );
    }

    public function test_stored_session_persists_across_requests(): void
    {
        $this->get('/?table=7')->assertOk();

        // Sesi masih hidup: kunjungan ulang tanpa query tetap meja 7.
        $this->withoutVite()
            ->get('/')
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'dine_in')
                ->where('tableNumber', 7)
            );
    }

    public function test_catalog_placeholder_route_renders(): void
    {
        // AC-6: tujuan CTA welcome (katalog asli = RFC-004).
        $this->withoutVite()
            ->get('/katalog')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Catalog'));
    }
}
