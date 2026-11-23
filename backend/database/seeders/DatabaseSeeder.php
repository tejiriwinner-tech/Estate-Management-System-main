<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,      // must run before users so the observer can assign roles
            UserSeeder::class,       // admin module
            DashboardSeeder::class,  // admin module
            StaffSeeder::class,      // admin module
            StoreDashboardSeeder::class, // store module
        ]);
    }
}
