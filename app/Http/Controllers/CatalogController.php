<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Placeholder destination for the welcome CTA (RFC-003 AC-6). The real
     * catalog browsing experience belongs to RFC-004.
     */
    public function __invoke(): Response
    {
        return Inertia::render('Catalog', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
        ]);
    }
}
