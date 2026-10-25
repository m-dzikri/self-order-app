<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class TokenCssVisualTest extends TestCase
{
    /**
     * Jalur stylesheet hasil build Vite dari manifest, atau null bila belum dibangun.
     */
    private function builtStylesheetPath(): ?string
    {
        $manifestPath = public_path('build/manifest.json');

        if (! File::exists($manifestPath)) {
            return null;
        }

        $manifest = json_decode(File::get($manifestPath), true);
        $file = $manifest['resources/css/app.css']['file'] ?? null;

        if ($file === null) {
            return null;
        }

        $path = public_path('build/'.$file);

        return File::exists($path) ? $path : null;
    }

    /**
     * TC-001-3 (bagian font): root page memuat Epilogue & Nunito Sans (UI-3).
     */
    public function test_root_page_loads_epilogue_and_nunito_sans_fonts(): void
    {
        $this->withoutVite();

        $this->get('/')
            ->assertOk()
            ->assertSee('fonts.googleapis.com')
            ->assertSee('family=Epilogue')
            ->assertSee('family=Nunito+Sans');
    }

    /**
     * TC-001-3 (bagian token): stylesheet hasil build memuat token desain
     * sketchbook, utility benar-benar terkompilasi, dan bebas #000000 (UI-2).
     */
    public function test_built_stylesheet_contains_design_tokens(): void
    {
        $path = $this->builtStylesheetPath();

        if ($path === null) {
            $this->markTestSkipped('Manifest Vite tidak ditemukan — jalankan `npm run build` terlebih dahulu.');
        }

        $css = File::get($path);

        // Palet wajib (UI-2) dan elevasi taktil (UI-4) — heksadesimal case-insensitive.
        $this->assertStringContainsStringIgnoringCase('#FFF9EF', $css, 'Latar kertas sketsa #FFF9EF tidak ada di stylesheet.');
        $this->assertStringContainsStringIgnoringCase('#4A2C17', $css, 'Tinta espresso #4A2C17 tidak ada di stylesheet.');
        $this->assertStringContainsString('3px 3px 0', $css, 'Hard shadow 3px 3px 0 tidak ada di stylesheet.');
        $this->assertStringContainsString('1px 1px 0', $css, 'Efek press 1px 1px 0 tidak ada di stylesheet.');

        // Tipografi (UI-3).
        $this->assertStringContainsString('Epilogue', $css, 'Font Epilogue tidak ada di stylesheet.');
        $this->assertStringContainsString('Nunito Sans', $css, 'Font Nunito Sans tidak ada di stylesheet.');

        // Regresi Round 1: utility Tailwind wajib benar-benar terkompilasi
        // (dulu seluruh utility JSX mati karena Tailwind tidak terpasang).
        $this->assertMatchesRegularExpression('/\.rounded-xl\s*\{/', $css, 'Utility Tailwind .rounded-xl tidak terkompilasi.');
        $this->assertStringContainsString('btn-tactile', $css, 'Kelas taktil btn-tactile tidak ada di stylesheet.');

        // UI-2: dilarang keras hitam digital murni, termasuk turunan alpha-nya.
        $this->assertStringNotContainsStringIgnoringCase('#000000', $css, 'Hitam #000000 ditemukan di stylesheet (UI-2).');
    }
}
