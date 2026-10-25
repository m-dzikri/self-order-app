<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TableQrController extends Controller
{
    /**
     * Display printable acrylic standee cards with live QR codes for cafe tables.
     */
    public function index(Request $request): Response
    {
        $baseUrl = $request->root();
        $totalTables = 20;

        $tables = [];
        for ($i = 1; $i <= $totalTables; $i++) {
            $formattedNumber = str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            $tables[] = [
                'number' => $i,
                'label' => 'Meja '.$formattedNumber,
                'short_label' => 'M-'.$formattedNumber,
                'url' => $baseUrl.'/?table='.$i,
            ];
        }

        return Inertia::render('TableQrList', [
            'appName' => config('app.name', 'Kopi Corat-Coret'),
            'tables' => $tables,
            'baseUrl' => $baseUrl,
            'currentSession' => $request->session()->get('order_session', []),
        ]);
    }
}
