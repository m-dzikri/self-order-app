<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RootPageTest extends TestCase
{
    /** @test */
    public function root_page_renders_inertia_app()
    {
        $response = $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome')
                ->has('appName')
            );
    }
}
