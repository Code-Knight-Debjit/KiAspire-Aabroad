<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower(trim((string) env('ADMIN_EMAIL', 'admin@example.com')));

        $existingAdmin = User::where('email', $email)->first();

        if ($existingAdmin) {
            $this->command?->info('Default admin already exists');

            return;
        }

        User::create([
            'name' => env('ADMIN_NAME', 'Super Admin'),
            'email' => $email,
            'phone' => env('ADMIN_PHONE', '9999999999'),
            'password' => Hash::make((string) env('ADMIN_PASSWORD', 'password')),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->command?->info('Default admin created successfully');
    }
}
