<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::firstOrCreate(['id' => 1], [
            'site_name' => 'Cholo Jai',
            'tagline' => 'Find events worth going to',
            'default_city' => 'Dhaka',
            'default_outbound_label' => 'Register',
            'outbound_labels' => ['Register', 'Buy Tickets', 'RSVP', 'Contact Organizer', 'Get Pass', 'Sign Up'],
            'pixels' => [],
            'meta_tags' => [],
        ]);
    }
}
