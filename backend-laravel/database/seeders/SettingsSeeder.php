<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $setting = Setting::firstOrNew(['id' => 1]);
        $setting->fill([
            'site_name' => 'Cholo Jai',
            'tagline' => 'Find events worth going to',
            'default_city' => 'Dhaka',
            'default_outbound_label' => 'Register',
            'outbound_labels' => ['Register', 'Buy Tickets', 'RSVP', 'Contact Organizer', 'Get Pass', 'Sign Up'],
            'pixels' => [],
            'meta_tags' => [],
        ]);
        $setting->save();
    }
}
