<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\MenuResource\Pages\CreateMenu;
use App\Filament\Resources\MenuResource\Pages\EditMenu;
use App\Filament\Resources\MenuResource\Pages\ListMenus;
use App\Models\Category;
use App\Models\Menu;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class MenuCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
        $this->category = Category::create([
            'name' => 'Kopi Susu',
            'slug' => 'kopi-susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_create_menu_with_modifiers(): void
    {
        $this->actingAs($this->admin);

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => 'Es Kopi Corat-Coret',
                'category_id' => $this->category->id,
                'description' => 'Kopi susu gula aren spesial sketsa.',
                'price' => 22000,
                'badge' => 'favorit',
                'is_active' => true,
                'is_in_stock' => true,
                'modifiers' => [
                    [
                        'type' => 'susu',
                        'name' => 'Oat Milk',
                        'extra_price' => 6000,
                    ],
                    [
                        'type' => 'topping',
                        'name' => 'Espresso Shot',
                        'extra_price' => 5000,
                    ],
                ],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('menus', [
            'name' => 'Es Kopi Corat-Coret',
            'category_id' => $this->category->id,
            'price' => 22000,
            'badge' => 'favorit',
            'is_in_stock' => true,
        ]);

        $this->assertDatabaseHas('menu_modifiers', [
            'type' => 'susu',
            'name' => 'Oat Milk',
            'extra_price' => 6000,
        ]);

        $this->assertDatabaseHas('menu_modifiers', [
            'type' => 'topping',
            'name' => 'Espresso Shot',
            'extra_price' => 5000,
        ]);
    }

    public function test_menu_form_rejects_negative_price(): void
    {
        $this->actingAs($this->admin);

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => 'Kopi Murah',
                'category_id' => $this->category->id,
                'price' => -5000,
            ])
            ->call('create')
            ->assertHasFormErrors(['price' => 'min']);

        $this->assertDatabaseMissing('menus', [
            'name' => 'Kopi Murah',
        ]);
    }

    public function test_menu_form_rejects_empty_name(): void
    {
        $this->actingAs($this->admin);

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => '',
                'category_id' => $this->category->id,
                'price' => 20000,
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);

        $this->assertDatabaseMissing('menus', [
            'price' => 20000,
        ]);
    }

    public function test_menu_list_renders_with_badge_menu(): void
    {
        $this->actingAs($this->admin);

        $menu = Menu::create([
            'category_id' => $this->category->id,
            'name' => 'Kopi Bertanda Favorit',
            'description' => 'Menu untuk pengujian badge',
            'price' => 25000,
            'badge' => 'favorit',
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        Livewire::test(ListMenus::class)
            ->assertSuccessful()
            ->assertCanSeeTableRecords([$menu])
            ->assertSee('Favorit');
    }

    public function test_edit_menu_form_hydrates_and_saves_badge_state(): void
    {
        $this->actingAs($this->admin);

        $menu = Menu::create([
            'category_id' => $this->category->id,
            'name' => 'Kopi Edit Badge',
            'description' => 'Menu edit badge test',
            'price' => 25000,
            'badge' => 'spesial',
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        Livewire::test(EditMenu::class, ['record' => $menu->getRouteKey()])
            ->assertFormSet(['badge' => 'spesial'])
            ->fillForm(['badge' => 'favorit'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('menus', [
            'id' => $menu->id,
            'badge' => 'favorit',
        ]);
    }

    public function test_admin_can_upload_image_for_menu(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin);

        // Minimal valid 1x1 PNG binary payload (doesn't require GD extension)
        $pngContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        $file = UploadedFile::fake()->createWithContent('kopi-senja.png', $pngContent);

        Livewire::test(CreateMenu::class)
            ->fillForm([
                'name' => 'Kopi Gambar',
                'category_id' => $this->category->id,
                'price' => 25000,
                'image_path' => $file,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $menu = Menu::where('name', 'Kopi Gambar')->first();
        $this->assertNotNull($menu);
        $this->assertNotNull($menu->image_path);
        Storage::disk('public')->assertExists($menu->image_path);
    }

    public function test_admin_can_delete_menu(): void
    {
        $this->actingAs($this->admin);

        $menu = Menu::create([
            'category_id' => $this->category->id,
            'name' => 'Menu Dihapus',
            'price' => 10000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        Livewire::test(ListMenus::class)
            ->callTableAction('delete', $menu);

        $this->assertDatabaseMissing('menus', [
            'id' => $menu->id,
        ]);
    }

    public function test_menu_seeder_populates_full_catalog(): void
    {
        $this->seed(CategorySeeder::class);
        $this->seed(MenuSeeder::class);

        $this->assertDatabaseCount('menus', 6);
        $this->assertDatabaseHas('menus', ['name' => 'Kopi Susu Senja', 'price' => 22000, 'badge' => 'favorit']);
        $this->assertDatabaseHas('menus', ['name' => 'V60 Flores Bajawa', 'price' => 28000, 'badge' => 'spesial']);
        $this->assertDatabaseHas('menus', ['name' => 'Pisang Goreng Wijen', 'is_in_stock' => false]);
    }
}
