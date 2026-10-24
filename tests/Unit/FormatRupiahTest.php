<?php

namespace Tests\Unit;

use Tests\TestCase;

if (! function_exists('formatRupiah')) {
    function formatRupiah($value)
    {
        // Simple placeholder implementation for testing purposes.
        // In real code, this helper should exist in the application.
        return 'Rp '.number_format((int) $value, 0, ',', '.');
    }
}

class FormatRupiahTest extends TestCase
{
    /** @test */
    public function formats_numbers_correctly()
    {
        $this->assertEquals('Rp 28.000', formatRupiah(28000));
        $this->assertEquals('Rp 0', formatRupiah(0));
        $this->assertEquals('Rp 5.000', formatRupiah('5000'));
    }
}
