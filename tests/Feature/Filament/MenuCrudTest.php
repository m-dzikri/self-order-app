<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\MenuResource\Pages\CreateMenu;
use App\Models\Category;
use App\Models\Menu;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class MenuCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create();
    }

    public function test_admin_can_create_menu_with_modifiers(): void
    {
        $category = Category::create([
            'name' => 'Kopi Susu',
            'slug' => 'kopi-susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin());

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => 'Es Kopi Corat-Coret',
                'category_id' => $category->getKey(),
                'description' => 'Kopi susu gula aren khas atelier.',
                'price' => 22000,
                'badge' => 'favorit',
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [
                    [
                        'type' => 'susu',
                        'name' => 'Oat Milk Barista Blend',
                        'extra_price' => 6000,
                    ],
                    [
                        'type' => 'topping',
                        'name' => 'Ekstra Espresso Shot',
                        'extra_price' => 5000,
                    ],
                ],
            ])
            ->call('create');

        $menu = Menu::firstWhere('name', 'Es Kopi Corat-Coret');

        $this->assertNotNull($menu);
        $this->assertSame($category->id, $menu->category_id);
        $this->assertSame(22000, $menu->price);

        $this->assertDatabaseHas('menu_modifiers', [
            'menu_id' => $menu->id,
            'type' => 'susu',
            'name' => 'Oat Milk Barista Blend',
            'extra_price' => 6000,
        ]);
        $this->assertDatabaseHas('menu_modifiers', [
            'menu_id' => $menu->id,
            'type' => 'topping',
            'name' => 'Ekstra Espresso Shot',
            'extra_price' => 5000,
        ]);
    }

    public function test_menu_form_rejects_negative_price(): void
    {
        $category = Category::create([
            'name' => 'Camilan',
            'slug' => 'camilan',
            'sort_order' => 4,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin());

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => 'Croissant Aneh',
                'category_id' => $category->getKey(),
                'price' => -5000,
                'is_active' => true,
                'is_in_stock' => true,
            ])
            ->call('create')
            ->assertHasFormErrors(['price' => 'min']);

        $this->assertDatabaseCount('menus', 0);
    }

    public function test_menu_form_rejects_empty_name(): void
    {
        $category = Category::create([
            'name' => 'Camilan',
            'slug' => 'camilan',
            'sort_order' => 4,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin());

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => '',
                'category_id' => $category->getKey(),
                'price' => 20000,
                'is_active' => true,
                'is_in_stock' => true,
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);

        $this->assertDatabaseCount('menus', 0);
    }

    public function test_menu_seeder_populates_full_catalog(): void
    {
        $this->seed([CategorySeeder::class, MenuSeeder::class]);

        $this->assertDatabaseCount('menus', 6);
        $this->assertDatabaseHas('menus', [
            'name' => 'Es Kopi Susu Aren',
            'price' => 22000,
            'badge' => 'favorit',
            'is_in_stock' => true,
        ]);
        // Sesuai mock katalog, Croissant Almond ditandai habis.
        $this->assertDatabaseHas('menus', [
            'name' => 'Croissant Almond',
            'price' => 24000,
            'is_in_stock' => false,
        ]);

        $esKopi = Menu::firstWhere('name', 'Es Kopi Susu Aren');
        $this->assertSame(7, $esKopi->modifiers()->count());

        $oatMilk = $esKopi->modifiers()->where('name', 'Oat Milk Barista Blend')->first();
        $this->assertSame(6000, $oatMilk->extra_price);
    }
}
