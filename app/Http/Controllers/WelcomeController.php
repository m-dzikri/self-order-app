<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Render the sketchbook welcome page. Table detection (Dine-In vs
     * Takeaway) is implemented in RFC-003; here the page is a static shell.
     */
    public function __invoke(): Response
    {
        return Inertia::render('Welcome', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
        ]);
    }
}
