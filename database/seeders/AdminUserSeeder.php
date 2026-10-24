<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Env;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Retrieve admin credentials from .env (fallback to defaults for local development)
        $email = Env::get('ADMIN_EMAIL', 'admin@example.com');
        $password = Env::get('ADMIN_PASSWORD', 'password');

        // Create or update the admin user
        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'password' => Hash::make($password),
                // Filament uses "admin" role by default when the "filament/filament" package is installed
                'email_verified_at' => now(),
            ]
        );
    }
}
