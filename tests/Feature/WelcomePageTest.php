<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

// TC-001-1: Rendering Root Template Inertia
class WelcomePageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_root_route_renders_inertia_welcome_page(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('appName')
            ->where('appName', config('app.name')));
    }

    public function test_root_route_returns_app_blade_shell(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('id="app"', false);
    }
}
