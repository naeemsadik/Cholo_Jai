<?php

namespace Database\Seeders;

use App\Models\CmsHome;
use Illuminate\Database\Seeder;

class CmsHomeSeeder extends Seeder
{
    public function run(): void
    {
        $home = CmsHome::firstOrNew(['id' => 1]);
        $home->fill([
            'order_section' => ['hero', 'upcoming', 'categories', 'submit_cta', 'footer'],
            'sections' => [
                'hero' => [
                    'type' => 'hero',
                    'title' => 'Find events worth going to',
                    'config' => [],
                ],
                'upcoming' => [
                    'type' => 'events_grid',
                    'title' => 'Upcoming this week',
                    'config' => ['limit' => 12, 'filter' => 'featured'],
                ],
                'categories' => [
                    'type' => 'category_grid',
                    'title' => 'Browse by category',
                    'config' => [],
                ],
                'submit_cta' => [
                    'type' => 'call_to_action',
                    'title' => 'Running an event?',
                    'config' => ['button_label' => 'Submit your event', 'href' => '/submit'],
                ],
                'footer' => [
                    'type' => 'footer',
                    'title' => null,
                    'config' => [],
                ],
            ],
        ]);
        $home->save();
    }
}
