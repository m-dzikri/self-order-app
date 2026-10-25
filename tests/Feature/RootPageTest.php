<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RootPageTest extends TestCase
{
    public function test_root_page_renders_inertia_app(): void
    {
        $this->withoutVite();

        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->has('appName')
            );
    }
}
