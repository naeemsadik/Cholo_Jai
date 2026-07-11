<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // 12 categories — matches frontend_rebuild/lib/categories.ts
        $categories = [
            ['name' => 'Workshops', 'slug' => 'workshops', 'sort_order' => 1],
            ['name' => 'Seminars', 'slug' => 'seminars', 'sort_order' => 2],
            ['name' => 'University Events', 'slug' => 'university-events', 'sort_order' => 3],
            ['name' => 'Student Events', 'slug' => 'student-events', 'sort_order' => 4],
            ['name' => 'Family Events', 'slug' => 'family-events', 'sort_order' => 5],
            ['name' => 'Weekend Events', 'slug' => 'weekend-events', 'sort_order' => 6],
            ['name' => 'Concerts', 'slug' => 'concerts', 'sort_order' => 7],
            ['name' => 'Exhibitions', 'slug' => 'exhibitions', 'sort_order' => 8],
            ['name' => 'Food Events', 'slug' => 'food-events', 'sort_order' => 9],
            ['name' => 'Sports', 'slug' => 'sports', 'sort_order' => 10],
            ['name' => 'Islamic Community', 'slug' => 'islamic-community', 'sort_order' => 11],
            ['name' => 'Free Events', 'slug' => 'free-events', 'sort_order' => 12],
        ];

        foreach ($categories as $i => $c) {
            Category::query()->updateOrCreate(
                ['slug' => $c['slug']],
                [
                    'name' => $c['name'],
                    'is_active' => true,
                    'sort_order' => $c['sort_order'],
                ]
            );
        }
    }
}
