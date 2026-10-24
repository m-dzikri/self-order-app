<?php

namespace Tests\Feature\Filament;

use App\Filament\Resources\CategoryResource\Pages\CreateCategory;
use App\Filament\Resources\CategoryResource\Pages\EditCategory;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create();
    }

    public function test_admin_panel_requires_authentication(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_admin_can_create_category(): void
    {
        $this->actingAs($this->admin());

        Livewire::test(CreateCategory::class)
            ->fillForm([
                'name' => 'Manual Brew',
                'slug' => 'manual-brew',
                'sort_order' => 6,
                'is_active' => true,
            ])
            ->call('create');

        $this->assertDatabaseHas('categories', [
            'name' => 'Manual Brew',
            'slug' => 'manual-brew',
            'sort_order' => 6,
            'is_active' => true,
        ]);
    }

    public function test_category_form_rejects_empty_name(): void
    {
        $this->actingAs($this->admin());

        Livewire::test(CreateCategory::class)
            ->fillForm([
                'name' => '',
                'slug' => 'tanpa-nama',
                'sort_order' => 1,
                'is_active' => true,
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);

        $this->assertDatabaseCount('categories', 0);
    }

    public function test_admin_can_update_category_sort_order(): void
    {
        $category = Category::create([
            'name' => 'Camilan',
            'slug' => 'camilan',
            'sort_order' => 4,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin());

        Livewire::test(EditCategory::class, ['record' => $category->getKey()])
            ->fillForm([
                'name' => 'Camilan',
                'slug' => 'camilan',
                'sort_order' => 9,
                'is_active' => false,
            ])
            ->call('save');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'sort_order' => 9,
            'is_active' => false,
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
