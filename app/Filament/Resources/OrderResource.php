<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationLabel = 'Antrean Pesanan';

    protected static ?string $modelLabel = 'Pesanan';

    protected static ?string $pluralModelLabel = 'Pesanan Masuk';

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::whereIn('status', [
            Order::STATUS_UNPAID_CASHIER,
            Order::STATUS_CONFIRMED,
            Order::STATUS_IN_PROGRESS,
        ])->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Pesanan')
                    ->schema([
                        Forms\Components\TextInput::make('order_code')
                            ->label('Kode Pesanan')
                            ->disabled(),
                        Forms\Components\TextInput::make('session_type')
                            ->label('Tipe Sesi')
                            ->formatStateUsing(fn ($state) => $state === 'dine_in' ? 'Dine In' : 'Takeaway')
                            ->disabled(),
                        Forms\Components\TextInput::make('table_number')
                            ->label('Nomor Meja')
                            ->disabled(),
                        Forms\Components\TextInput::make('customer_name')
                            ->label('Nama Pelanggan')
                            ->disabled(),
                        Forms\Components\TextInput::make('customer_phone')
                            ->label('No. WhatsApp')
                            ->disabled(),
                        Forms\Components\TextInput::make('payment_method')
                            ->label('Metode Pembayaran')
                            ->formatStateUsing(fn ($state) => strtoupper($state))
                            ->disabled(),
                        Forms\Components\Select::make('status')
                            ->label('Status Pesanan')
                            ->options([
                                Order::STATUS_UNPAID_CASHIER => 'Menunggu Pembayaran di Kasir',
                                Order::STATUS_CONFIRMED => 'Pesanan Diterima',
                                Order::STATUS_IN_PROGRESS => 'Sedang Diracik',
                                Order::STATUS_READY => 'Siap Diambil/Diantar',
                                Order::STATUS_COMPLETED => 'Selesai',
                                Order::STATUS_CANCELLED => 'Dibatalkan',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('total')
                            ->label('Total Bayar')
                            ->prefix('Rp')
                            ->formatStateUsing(fn ($state) => number_format((int) $state, 0, ',', '.'))
                            ->disabled(),
                        Forms\Components\Textarea::make('notes')
                            ->label('Catatan Pelanggan')
                            ->disabled()
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_code')
                    ->label('Kode')
                    ->searchable()
                    ->copyable()
                    ->weight('bold')
                    ->description(fn (Order $record) => $record->session_type === 'dine_in' ? 'Meja '.($record->table_number ?? '-') : 'Takeaway'),

                Tables\Columns\TextColumn::make('customer_name')
                    ->label('Pelanggan')
                    ->searchable()
                    ->default(fn (Order $record) => $record->table_number ? 'Meja '.$record->table_number : 'Tamu')
                    ->description(fn (Order $record) => $record->customer_phone ?: null),

                Tables\Columns\TextColumn::make('items_summary')
                    ->label('Pesanan')
                    ->state(fn (Order $record) => $record->items->map(fn ($i) => "{$i->quantity}x {$i->menu_name}")->join(', '))
                    ->limit(35)
                    ->tooltip(fn (Order $record) => $record->items->map(fn ($i) => "{$i->quantity}x {$i->menu_name} ({$i->modifiers_summary})")->join("\n")),

                Tables\Columns\TextColumn::make('total')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => 'Rp '.number_format((int) $state, 0, ',', '.'))
                    ->weight('bold')
                    ->sortable(),

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
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                // Aksi Kasir: Konfirmasi Lunas (F20, TC-007-1)
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
                        Notification::make()
                            ->title('Pembayaran Dikonfirmasi')
                            ->body("Pesanan {$record->order_code} lunas dan status beralih ke Diterima.")
                            ->success()
                            ->send();
                    }),

                // Aksi Barista: Mulai Racik (TC-007-3)
                Tables\Actions\Action::make('start_process')
                    ->label('Mulai Racik')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->button()
                    ->visible(fn (Order $record) => $record->status === Order::STATUS_CONFIRMED)
                    ->action(function (Order $record) {
                        $record->update(['status' => Order::STATUS_IN_PROGRESS]);
                        Notification::make()
                            ->title('Pesanan Diracik')
                            ->body("Pesanan {$record->order_code} masuk tahap peracikan.")
                            ->warning()
                            ->send();
                    }),

                // Aksi Barista: Tandai Siap Diambil/Diantar (TC-007-3)
                Tables\Actions\Action::make('mark_ready')
                    ->label('Tandai Siap')
                    ->icon('heroicon-o-bell-alert')
                    ->color('info')
                    ->button()
                    ->visible(fn (Order $record) => $record->status === Order::STATUS_IN_PROGRESS)
                    ->action(function (Order $record) {
                        $record->update(['status' => Order::STATUS_READY]);
                        Notification::make()
                            ->title('Pesanan Siap!')
                            ->body("Pesanan {$record->order_code} siap disajikan ke pelanggan.")
                            ->info()
                            ->send();
                    }),

                // Aksi Final: Selesaikan Pesanan
                Tables\Actions\Action::make('complete')
                    ->label('Selesai')
                    ->icon('heroicon-o-check')
                    ->color('gray')
                    ->visible(fn (Order $record) => $record->status === Order::STATUS_READY)
                    ->action(function (Order $record) {
                        $record->update(['status' => Order::STATUS_COMPLETED]);
                        Notification::make()
                            ->title('Pesanan Selesai')
                            ->body("Pesanan {$record->order_code} telah selesai.")
                            ->success()
                            ->send();
                    }),

                Tables\Actions\ViewAction::make()
                    ->label('Detail')
                    ->icon('heroicon-o-eye'),
            ])
            ->poll('4s');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
        ];
    }
}
