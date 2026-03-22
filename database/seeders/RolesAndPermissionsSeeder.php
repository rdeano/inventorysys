<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $staffRole = Role::create(['name' => 'staff']);

        // Create default admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@inventory.com',
            'password' => Hash::make('password'),
        ]);

        $admin->assignRole('admin');
    }
}