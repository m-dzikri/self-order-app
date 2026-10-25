<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestOrdersWidget extends BaseWidget
{
    protected static ?string $heading = 'Pesanan Masuk Terbaru';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Order::query()->latest()
            )
            ->paginated([5])
            ->defaultPaginationPageOption(5)
            ->columns([
                Tables\Columns\TextColumn::make('order_code')
                    ->label('Kode')
                    ->weight('bold')
                    ->copyable()
                    ->description(fn (Order $record) => $record->session_type === 'dine_in' ? 'Meja '.($record->table_number ?? '-') : 'Takeaway'),

                Tables\Columns\TextColumn::make('customer_name')
                    ->label('Pelanggan')
                    ->default(fn (Order $record) => $record->table_number ? 'Meja '.$record->table_number : 'Tamu')
                    ->description(fn (Order $record) => $record->customer_phone ?: null),

                Tables\Columns\TextColumn::make('items_summary')
                    ->label('Pesanan')
                    ->state(fn (Order $record) => $record->items->map(fn ($i) => "{$i->quantity}x {$i->menu_name}")->join(', '))
                    ->limit(35),

                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => 'Rp '.number_format((int) $state, 0, ',', '.'))
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Metode')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        Order::PAYMENT_CASHIER => 'Kasir',
                        Order::PAYMENT_QRIS => 'QRIS',
                        Order::PAYMENT_EWALLET => 'E-Wallet',
                        default => strtoupper($state),
                    })
                    ->color(fn ($state) => match ($state) {
                        Order::PAYMENT_CASHIER => 'warning',
                        Order::PAYMENT_QRIS => 'info',
                        Order::PAYMENT_EWALLET => 'primary',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        Order::STATUS_UNPAID_CASHIER => 'Menunggu Kasir',
                        Order::STATUS_CONFIRMED => 'Diterima',
                        Order::STATUS_IN_PROGRESS => 'Sedang Diracik',
                        Order::STATUS_READY => 'Siap Diambil',
                        Order::STATUS_COMPLETED => 'Selesai',
                        Order::STATUS_CANCELLED => 'Batal',
                        default => $state,
                    })
                    ->color(fn ($state) => match ($state) {
                        Order::STATUS_UNPAID_CASHIER => 'danger',
                        Order::STATUS_CONFIRMED => 'warning',
                        Order::STATUS_IN_PROGRESS => 'info',
                        Order::STATUS_READY => 'success',
                        Order::STATUS_COMPLETED => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Waktu')
                    ->since(),
            ])
            ->actions([
                Tables\Actions\Action::make('confirm_payment')
                    ->label('Konfirmasi Lunas')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->button()
                    ->requiresConfirmation()
                    ->modalHeading('Konfirmasi Pembayaran Kasir')
                    ->modalDescription(fn (Order $record) => "Tandai pembayaran pesanan {$record->order_code} lunas sebesar Rp ".number_format($record->total, 0, ',', '.').'?')
                    ->visible(fn (Order $record) => $record->status === Order::STATUS_UNPAID_CASHIER)
                    ->action(function (Order $record) {
                        $record->update(['status' => Order::STATUS_CONFIRMED]);
                    }),
            ]);
    }
}
