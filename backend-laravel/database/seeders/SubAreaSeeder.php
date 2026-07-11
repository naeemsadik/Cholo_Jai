<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\SubArea;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubAreaSeeder extends Seeder
{
    public function run(): void
    {
        // 16 Dhaka sub-areas from frontend_rebuild/lib/fallback-data.ts
        $names = [
            'Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mirpur',
            'Bashundhara', 'Mohammadpur', 'Tejgaon', 'Farmgate',
            'Motijheel', 'Old Dhaka', 'Hatirjheel', 'Baily Road',
            'Purbachal', 'Dhaka University area', 'Other',
        ];

        $city = City::query()->where('slug', 'dhaka')->firstOrFail();

        foreach ($names as $name) {
            $slug = $name === 'Other' ? 'other' : Str::slug($name);
            SubArea::query()->updateOrCreate(
                ['city_id' => $city->id, 'slug' => $slug],
                ['name' => $name, 'is_active' => true]
            );
        }
    }
}
