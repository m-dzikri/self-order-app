<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\MenuResource\Pages\ListMenus;
use App\Models\Category;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class MenuStockToggleTest extends TestCase
{
    use RefreshDatabase;

    private function seededMenu(): Menu
    {
        $category = Category::create([
            'name' => 'Kopi Susu',
            'slug' => 'kopi-susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        return Menu::create([
            'category_id' => $category->id,
            'name' => 'Es Kopi Susu Aren',
            'description' => 'Kopi susu gula aren.',
            'price' => 22000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);
    }

    public function test_stock_toggle_persists_to_database(): void
    {
        $menu = $this->seededMenu();

        $this->actingAs(User::factory()->create());

        Livewire::test(ListMenus::class)
            ->call('updateTableColumnState', 'is_in_stock', (string) $menu->getKey(), false);

        $this->assertDatabaseHas('menus', [
            'id' => $menu->id,
            'is_in_stock' => false,
        ]);
    }

    public function test_stock_toggle_can_be_restored(): void
    {
        $menu = $this->seededMenu();
        $menu->update(['is_in_stock' => false]);

        $this->actingAs(User::factory()->create());

        Livewire::test(ListMenus::class)
            ->call('updateTableColumnState', 'is_in_stock', (string) $menu->getKey(), true);

        $this->assertDatabaseHas('menus', [
            'id' => $menu->id,
            'is_in_stock' => true,
        ]);
    }
}
