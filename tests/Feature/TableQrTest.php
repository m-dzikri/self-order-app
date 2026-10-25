<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableQrTest extends TestCase
{
    use RefreshDatabase;

    public function test_table_qr_index_page_renders_with_table_list(): void
    {
        $response = $this->get('/meja-qr');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('TableQrList')
            ->has('tables', 20)
            ->where('tables.0.number', 1)
            ->where('tables.19.number', 20)
        );
    }

    public function test_switching_to_scanned_table_sets_session(): void
    {
        $response = $this->post('/session/switch-mode', [
            'mode' => 'dine_in',
            'table_number' => 15,
        ]);

        $response->assertRedirect();
        $this->assertEquals('dine_in', session('order_session.mode'));
        $this->assertEquals(15, session('order_session.table_number'));
    }

    public function test_switching_to_takeaway_clears_table_number(): void
    {
        session(['order_session' => ['mode' => 'dine_in', 'table_number' => 10]]);

        $response = $this->post('/session/switch-mode', [
            'mode' => 'takeaway',
        ]);

        $response->assertRedirect();
        $this->assertEquals('takeaway', session('order_session.mode'));
        $this->assertNull(session('order_session.table_number'));
    }
}
