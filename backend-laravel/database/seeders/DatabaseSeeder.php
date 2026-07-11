<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            CitySeeder::class,
            SubAreaSeeder::class,
            CategorySeeder::class,
            AudienceTagSeeder::class,
            SettingsSeeder::class,
            CmsHomeSeeder::class,
            CmsPageSeeder::class,
            DemoEventSeeder::class,
        ]);
    }
}
