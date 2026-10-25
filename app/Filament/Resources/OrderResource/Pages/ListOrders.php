<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Resources\Components\Tab;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Builder;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Semua Pesanan')
                ->badge(Order::query()->count()),

            'unpaid_cashier' => Tab::make('Menunggu Kasir')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', Order::STATUS_UNPAID_CASHIER))
                ->badge(Order::query()->where('status', Order::STATUS_UNPAID_CASHIER)->count())
                ->badgeColor('danger'),

            'processing' => Tab::make('Sedang Diproses')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereIn('status', [Order::STATUS_CONFIRMED, Order::STATUS_IN_PROGRESS]))
                ->badge(Order::query()->whereIn('status', [Order::STATUS_CONFIRMED, Order::STATUS_IN_PROGRESS])->count())
                ->badgeColor('warning'),

            'ready' => Tab::make('Siap Diambil/Diantar')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', Order::STATUS_READY))
                ->badge(Order::query()->where('status', Order::STATUS_READY)->count())
                ->badgeColor('success'),

            'completed' => Tab::make('Selesai')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', Order::STATUS_COMPLETED)),
        ];
    }
}
