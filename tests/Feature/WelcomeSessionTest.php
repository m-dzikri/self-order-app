<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
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

    public function test_zero_table_param_is_ignored(): void
    {
        // Meja 0 tidak sah (QR selalu 1-999).
        $this->withoutVite()
            ->get('/?table=0')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'takeaway')
            );
    }

    public function test_takeaway_session_converts_to_dine_in_keeping_customer_data(): void
    {
        // ARCH-4: parameter table yang sah mengunci mode dine-in, tetapi
        // data pelanggan yang sudah terisi tidak hilang.
        $this->withSession(['order_session' => [
            'mode' => 'takeaway',
            'name' => 'Sasa Putri',
            'phone' => '081234567890',
            'pickup_at' => '14:30',
        ]])
            ->get('/?table=12')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->where('mode', 'dine_in')
                ->where('tableNumber', 12)
                ->where('orderSession.name', 'Sasa Putri')
            );

        $session = session('order_session');

        $this->assertSame('dine_in', $session['mode']);
        $this->assertSame(12, $session['table_number']);
        $this->assertSame('Sasa Putri', $session['name']);
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

    /**
     * Jalur bundel halaman Welcome dari manifest Vite, atau null bila belum dibangun.
     */
    private function builtWelcomeBundlePath(): ?string
    {
        $manifestPath = public_path('build/manifest.json');

        if (! File::exists($manifestPath)) {
            return null;
        }

        $manifest = json_decode(File::get($manifestPath), true);
        $file = $manifest['resources/js/Pages/Welcome.jsx']['file'] ?? null;

        if ($file === null) {
            return null;
        }

        $path = public_path('build/'.$file);

        return File::exists($path) ? $path : null;
    }

    /**
     * Guard AC-5 (Round 1 review): banner kupon harus menampilkan kode
     * SKETCHKOPI dan diskon 10%. Diverifikasi terhadap bundel terbangun —
     * komponen React tidak punya DOM test tooling di stack ini.
     */
    public function test_welcome_bundle_renders_promo_voucher(): void
    {
        $path = $this->builtWelcomeBundlePath();

        if ($path === null) {
            $this->markTestSkipped('Bundel Welcome tidak ditemukan — jalankan `npm run build` terlebih dahulu.');
        }

        $bundle = File::get($path);

        $this->assertStringContainsString('SKETCHKOPI', $bundle, 'Kode kupon SKETCHKOPI tidak ada di bundel Welcome (AC-5).');
        $this->assertStringContainsString('Diskon 10%', $bundle, 'Klaim diskon 10% tidak ada di bundel Welcome (AC-5).');
    }

    /**
     * Wiring AC-2/AC-6: form takeaway dan CTA katalog harus benar-benar
     * terpasang di halaman Welcome (bukan sekadar komponennya ada).
     */
    public function test_welcome_bundle_wires_takeaway_form_and_catalog_cta(): void
    {
        $path = $this->builtWelcomeBundlePath();

        if ($path === null) {
            $this->markTestSkipped('Bundel Welcome tidak ditemukan — jalankan `npm run build` terlebih dahulu.');
        }

        $bundle = File::get($path);

        $this->assertStringContainsString('/session/takeaway', $bundle, 'Form takeaway tidak menyambung ke POST /session/takeaway.');
        $this->assertStringContainsString('/katalog', $bundle, 'CTA Mulai Pesan tidak menyambung ke /katalog.');
        $this->assertStringContainsString('ngopiyuk123', $bundle, 'Sandi Wi-Fi tidak ada di bundel Welcome (AC-4).');
    }
}
