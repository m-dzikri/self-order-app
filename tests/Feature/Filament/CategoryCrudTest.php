<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\CategoryResource\Pages\CreateCategory;
use App\Filament\Resources\CategoryResource\Pages\EditCategory;
use App\Filament\Resources\CategoryResource\Pages\ListCategories;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    public function test_admin_panel_requires_authentication(): void
    {
        $response = $this->get('/admin/categories');
        $response->assertRedirect('/admin/login');
    }

    public function test_admin_can_create_category(): void
    {
        $this->actingAs($this->admin);

        Livewire::test(CreateCategory::class)
            ->fillForm([
                'name' => 'Manual Brew',
                'slug' => 'manual-brew',
                'sort_order' => 2,
                'is_active' => true,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('categories', [
            'name' => 'Manual Brew',
            'slug' => 'manual-brew',
            'sort_order' => 2,
            'is_active' => true,
        ]);
    }

    public function test_category_form_rejects_empty_name(): void
    {
        $this->actingAs($this->admin);

        Livewire::test(CreateCategory::class)
            ->fillForm([
                'name' => '',
                'slug' => 'manual-brew',
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);

        $this->assertDatabaseMissing('categories', [
            'slug' => 'manual-brew',
        ]);
    }

    public function test_admin_can_update_category_sort_order(): void
    {
        $this->actingAs($this->admin);

        $category = Category::create([
            'name' => 'Kopi Susu',
            'slug' => 'kopi-susu',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Livewire::test(EditCategory::class, ['record' => $category->getRouteKey()])
            ->fillForm([
                'sort_order' => 10,
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'sort_order' => 10,
        ]);
    }

    public function test_admin_can_render_category_list_and_delete_category(): void
    {
        $this->actingAs($this->admin);

        $category = Category::create([
            'name' => 'Seasonal Special',
            'slug' => 'seasonal-special',
            'sort_order' => 99,
            'is_active' => true,
        ]);

        Livewire::test(ListCategories::class)
            ->assertSuccessful()
            ->assertCanSeeTableRecords([$category])
            ->callTableAction('delete', $category);

        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }

    public function test_category_seeder_populates_all_categories(): void
    {
        $this->seed(CategorySeeder::class);

        $this->assertDatabaseCount('categories', 5);
        $this->assertDatabaseHas('categories', ['slug' => 'kopi-susu', 'sort_order' => 1]);
        $this->assertDatabaseHas('categories', ['slug' => 'manual-brew', 'sort_order' => 2]);
        $this->assertDatabaseHas('categories', ['slug' => 'makanan-berat', 'sort_order' => 3]);
        $this->assertDatabaseHas('categories', ['slug' => 'camilan', 'sort_order' => 4]);
        $this->assertDatabaseHas('categories', ['slug' => 'non-kopi', 'sort_order' => 5]);
    }
}
