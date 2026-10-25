<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class OrdersChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Tren Omzet 7 Hari Terakhir';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $paidStatuses = [
            Order::STATUS_CONFIRMED,
            Order::STATUS_IN_PROGRESS,
            Order::STATUS_READY,
            Order::STATUS_COMPLETED,
        ];

        $labels = [];
        $revenueData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayLabel = $date->translatedFormat('d M');

            $revenue = Order::whereDate('created_at', $date)
                ->whereIn('status', $paidStatuses)
                ->sum('total');

            $labels[] = $dayLabel;
            $revenueData[] = (int) $revenue;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Omzet (Rp)',
                    'data' => $revenueData,
                    'borderColor' => '#4A2C17',
                    'backgroundColor' => 'rgba(255, 201, 60, 0.45)',
                    'fill' => true,
                    'tension' => 0.35,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
