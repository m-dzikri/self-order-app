<?php

namespace App\Filament\Widgets;

use App\Models\Menu;
use App\Models\Order;
use Carbon\Carbon;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $today = Carbon::today();

        $paidStatuses = [
            Order::STATUS_CONFIRMED,
            Order::STATUS_IN_PROGRESS,
            Order::STATUS_READY,
            Order::STATUS_COMPLETED,
        ];

        // 1. Omzet Hari Ini
        $todayOrders = Order::where('created_at', '>=', $today)
            ->whereIn('status', $paidStatuses)
            ->get();

        $todayRevenue = $todayOrders->sum('total');
        $todayCount = $todayOrders->count();

        // Trend sparkline 7 hari terakhir
        $trendRevenue = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Order::whereDate('created_at', $date)
                ->whereIn('status', $paidStatuses)
                ->sum('total');
            $trendRevenue[] = (int) $revenue;
        }

        // 2. Antrean Aktif (sedang berjalan)
        $activeCount = Order::whereIn('status', [
            Order::STATUS_CONFIRMED,
            Order::STATUS_IN_PROGRESS,
            Order::STATUS_READY,
        ])->count();

        // 3. Menunggu Pembayaran di Kasir
        $unpaidCashierCount = Order::where('status', Order::STATUS_UNPAID_CASHIER)->count();

        // 4. Menu Stok Habis
        $outOfStockCount = Menu::where('is_in_stock', false)->count();

        return [
            Stat::make('Omzet Hari Ini', 'Rp '.number_format($todayRevenue, 0, ',', '.'))
                ->description("{$todayCount} pesanan berhasil")
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->chart($trendRevenue)
                ->color('success'),

            Stat::make('Antrean Aktif', "{$activeCount} Pesanan")
                ->description('Sedang diracik & siap saji')
                ->descriptionIcon('heroicon-m-clock')
                ->color($activeCount > 0 ? 'warning' : 'gray'),

            Stat::make('Perlu Kasir', "{$unpaidCashierCount} Pesanan")
                ->description($unpaidCashierCount > 0 ? 'Menunggu konfirmasi bayar' : 'Semua pembayaran tuntas')
                ->descriptionIcon('heroicon-m-exclamation-circle')
                ->color($unpaidCashierCount > 0 ? 'danger' : 'gray'),

            Stat::make('Menu Habis', "{$outOfStockCount} Menu")
                ->description($outOfStockCount > 0 ? 'Perlu restock bahan' : 'Semua stok aman')
                ->descriptionIcon('heroicon-m-archive-box-x-mark')
                ->color($outOfStockCount > 0 ? 'danger' : 'success'),
        ];
    }
}
