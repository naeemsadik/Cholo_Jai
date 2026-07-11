<?php

namespace Database\Seeders;

use App\Models\AudienceTag;
use Illuminate\Database\Seeder;

class AudienceTagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'family', 'couples', 'friends', 'students', 'professionals',
            'women-friendly', 'kids-friendly', 'solo-friendly',
            'budget-friendly', 'free-entry', 'indoor', 'outdoor',
        ];

        foreach ($tags as $i => $slug) {
            $name = ucwords(str_replace('-', ' ', $slug));
            AudienceTag::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'is_active' => true,
                    'sort_order' => $i + 1,
                ]
            );
        }
    }
}
