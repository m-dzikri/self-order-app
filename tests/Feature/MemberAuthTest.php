<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MemberAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_as_member_with_valid_credentials(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'pin' => '123456',
        ];

        $response = $this->postJson('/member/register', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'user' => [
                'name' => 'Budi Santoso',
                'phone' => '081234567890',
                'role' => 'customer',
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'role' => 'customer',
        ]);

        $this->assertAuthenticated();
    }

    public function test_registration_rejects_invalid_whatsapp_or_short_name_or_invalid_pin(): void
    {
        // Name too short
        $res1 = $this->postJson('/member/register', [
            'name' => 'Al',
            'phone' => '081234567890',
            'pin' => '123456',
        ]);
        $res1->assertStatus(422)->assertJsonValidationErrors(['name']);

        // Invalid WA (non 08 or too short)
        $res2 = $this->postJson('/member/register', [
            'name' => 'Budi',
            'phone' => '123456',
            'pin' => '123456',
        ]);
        $res2->assertStatus(422)->assertJsonValidationErrors(['phone']);

        // PIN not 6 digits
        $res3 = $this->postJson('/member/register', [
            'name' => 'Budi',
            'phone' => '081234567890',
            'pin' => '1234',
        ]);
        $res3->assertStatus(422)->assertJsonValidationErrors(['pin']);
    }

    public function test_registration_rejects_duplicate_phone(): void
    {
        User::create([
            'name' => 'User Lama',
            'phone' => '081234567890',
            'email' => '081234567890@member.kopicoratcoret.com',
            'password' => Hash::make('123456'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/member/register', [
            'name' => 'User Baru',
            'phone' => '081234567890',
            'pin' => '654321',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['phone']);
    }

    public function test_member_can_login_with_phone_and_pin(): void
    {
        $user = User::create([
            'name' => 'Siti Member',
            'phone' => '081987654321',
            'email' => '081987654321@member.kopicoratcoret.com',
            'password' => Hash::make('654321'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/member/login', [
            'phone' => '081987654321',
            'pin' => '654321',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'user' => [
                'name' => 'Siti Member',
                'phone' => '081987654321',
            ],
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_member_login_fails_with_wrong_pin(): void
    {
        User::create([
            'name' => 'Siti Member',
            'phone' => '081987654321',
            'email' => '081987654321@member.kopicoratcoret.com',
            'password' => Hash::make('654321'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/member/login', [
            'phone' => '081987654321',
            'pin' => '999999',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);

        $this->assertGuest();
    }

    public function test_member_can_logout(): void
    {
        $user = User::create([
            'name' => 'Siti Member',
            'phone' => '081987654321',
            'email' => '081987654321@member.kopicoratcoret.com',
            'password' => Hash::make('654321'),
            'role' => 'customer',
        ]);

        $this->actingAs($user);
        $this->assertAuthenticated();

        $response = $this->postJson('/member/logout');
        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertGuest();
    }

    public function test_member_can_view_their_own_order_history(): void
    {
        $user = User::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'email' => '081234567890@member.kopicoratcoret.com',
            'password' => Hash::make('123456'),
            'role' => 'customer',
        ]);

        $category = Category::create([
            'name' => 'Kopi',
            'slug' => 'kopi',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $menu = Menu::create([
            'category_id' => $category->id,
            'name' => 'Kopi Susu Aren',
            'description' => 'Kopi susu.',
            'price' => 22000,
            'is_active' => true,
            'is_in_stock' => true,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_code' => '#ORD-7711',
            'session_type' => 'dine_in',
            'table_number' => '12',
            'customer_name' => $user->name,
            'customer_phone' => $user->phone,
            'payment_method' => 'qris',
            'status' => 'completed',
            'subtotal' => 22000,
            'discount' => 0,
            'pb1_tax' => 2200,
            'total' => 24200,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $menu->id,
            'menu_name' => $menu->name,
            'quantity' => 1,
            'unit_price' => 22000,
            'total_price' => 22000,
            'modifiers_summary' => 'Dingin • Normal',
        ]);

        $response = $this->actingAs($user)->getJson('/member/history');

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'member' => [
                'name' => 'Budi Santoso',
                'phone' => '081234567890',
            ],
        ]);
        $response->assertJsonFragment([
            'order_code' => '#ORD-7711',
            'total' => 24200,
        ]);
    }

    public function test_unauthenticated_guest_cannot_view_order_history(): void
    {
        $response = $this->getJson('/member/history');
        $response->assertStatus(401);
    }
}
