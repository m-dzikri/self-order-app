<?php

namespace App\Filament\Resources;

use App\Enums\BadgeEnum;
use App\Filament\Resources\MenuResource\Pages;
use App\Models\Menu;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MenuResource extends Resource
{
    protected static ?string $model = Menu::class;

    protected static ?string $navigationIcon = 'heroicon-o-bookmark-square';

    protected static ?string $navigationLabel = 'Item Menu';

    protected static ?string $modelLabel = 'Menu';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Menu')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nama Menu')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('category_id')
                            ->label('Kategori')
                            ->relationship('category', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Textarea::make('description')
                            ->label('Deskripsi')
                            ->rows(3)
                            ->maxLength(1000)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('price')
                            ->label('Harga')
                            ->numeric()
                            ->minValue(0)
                            ->required()
                            ->prefix('Rp')
                            ->helperText('Nilai dalam Rupiah, contoh: 22000 = Rp 22.000'),
                        Forms\Components\Select::make('badge')
                            ->label('Badge Stempel Promo')
                            ->options([
                                BadgeEnum::FAVORIT->value => BadgeEnum::FAVORIT->label(),
                                BadgeEnum::SPESIAL->value => BadgeEnum::SPESIAL->label(),
                            ])
                            ->placeholder('Tanpa badge')
                            ->nullable(),
                        Forms\Components\FileUpload::make('image_path')
                            ->label('Gambar Menu (Polaroid)')
                            ->image()
                            ->disk('public')
                            ->directory('menu-images')
                            ->maxSize(2048)
                            ->nullable(),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Menu Aktif')
                            ->default(true),
                        Forms\Components\Toggle::make('is_in_stock')
                            ->label('Stok Tersedia (In Stock)')
                            ->default(true),
                    ])
                    ->columns(2),
                Forms\Components\Section::make('Varian & Add-on Berbayar')
                    ->schema([
                        Forms\Components\Repeater::make('modifiers')
                            ->relationship()
                            ->label('Modifier')
                            ->schema([
                                Forms\Components\Select::make('type')
                                    ->label('Jenis')
                                    ->options([
                                        'susu' => 'Jenis Susu',
                                        'topping' => 'Topping Ekstra',
                                        'suhu' => 'Suhu',
                                        'kemanisan' => 'Level Kemanisan',
                                    ])
                                    ->required(),
                                Forms\Components\TextInput::make('name')
                                    ->label('Nama Opsi')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('extra_price')
                                    ->label('Harga Tambahan')
                                    ->numeric()
                                    ->minValue(0)
                                    ->required()
                                    ->prefix('Rp'),
                            ])
                            ->columns(3)
                            ->defaultItems(0)
                            ->collapsible()
                            ->cloneable()
                            ->itemLabel(
                                fn (array $state): ?string => filled($state['name'] ?? null)
                                    ? sprintf(
                                        '%s (+Rp %s)',
                                        $state['name'],
                                        number_format((float) ($state['extra_price'] ?? 0), 0, ',', '.')
                                    )
                                    : null
                            ),
                    ])
                    ->collapsible()
                    ->description('Opsi susu dan topping yang dikenakan biaya tambahan. Opsi gratis (mis. suhu, kemanisan) diisi harga Rp 0.'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image_path')
                    ->label('Gambar')
                    ->disk('public')
                    ->size(40)
                    ->square(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Menu')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Kategori')
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->label('Harga')
                    ->formatStateUsing(fn (int $state): string => 'Rp '.number_format($state, 0, ',', '.'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('badge')
                    ->label('Badge')
                    ->badge()
                    ->formatStateUsing(
                        fn (?string $state): ?string => $state !== null ? BadgeEnum::from($state)->label() : null
                    )
                    ->color(
                        fn (?string $state): string => match ($state) {
                            BadgeEnum::FAVORIT->value => 'warning',
                            BadgeEnum::SPESIAL->value => 'danger',
                            default => 'gray',
                        }
                    )
                    ->placeholder('-'),
                Tables\Columns\ToggleColumn::make('is_in_stock')
                    ->label('Stok'),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Aktif'),
                Tables\Columns\TextColumn::make('modifiers_count')
                    ->label('Varian')
                    ->counts('modifiers')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->label('Kategori')
                    ->relationship('category', 'name'),
                Tables\Filters\TernaryFilter::make('is_in_stock')
                    ->label('Stok Tersedia'),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Menu Aktif'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('name');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMenus::route('/'),
            'create' => Pages\CreateMenu::route('/create'),
            'edit' => Pages\EditMenu::route('/{record}/edit'),
        ];
    }
}
