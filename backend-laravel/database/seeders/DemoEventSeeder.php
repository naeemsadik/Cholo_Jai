<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use App\Models\SubArea;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds 18 demo published events. Gated by env SEED_DEMO_EVENTS.
 *
 * The data is intentionally condensed — we want enough variety to exercise
 * every filter dimension (city, sub-area, date, weekend, category, audience
 * tag, price_type, is_featured, show_in_hero). Drawn from the same shape
 * that lives in frontend_rebuild/lib/fallback-data.ts.
 */
class DemoEventSeeder extends Seeder
{
    public function run(): void
    {
        if (! env('SEED_DEMO_EVENTS', false)) {
            return;
        }

        $city = City::query()->where('slug', 'dhaka')->firstOrFail();
        $subAreaByName = SubArea::query()->where('city_id', $city->id)->get()->keyBy('name');
        $catBySlug = Category::query()->get()->keyBy('slug');

        $today = Carbon::today();

        // Demo data — (title, subArea, dayOffset, hourMinute, categories[], priceType, isFeatured, showInHero, outboundLabel)
        $items = [
            ['Design Systems Workshop at Dhanmondi', 'Dhanmondi', 2, '18:30', ['workshops'], 'paid', true, true, 'Register'],
            ['Free Friday Movie Night — Gulshan', 'Gulshan', 0, '19:00', ['free-events', 'concerts'], 'free', true, false, 'Register'],
            ['Saturday Morning Photography Walk', 'Old Dhaka', 3, '07:00', ['exhibitions', 'weekend-events'], 'free', false, false, 'Register'],
            ['Live Jazz at Banani Rooftop', 'Banani', 5, '20:00', ['concerts'], 'paid', true, true, 'Buy Tickets'],
            ['Tech Networking at Bashundhara', 'Bashundhara', 7, '19:00', ['seminars', 'student-events'], 'free', false, false, 'RSVP'],
            ['Saturday Brunch & Storytelling at Uttara', 'Uttara', 3, '11:00', ['food-events', 'family-events'], 'paid', false, false, 'Register'],
            ['University Career Fair at DU', 'Dhaka University area', 10, '10:00', ['university-events', 'student-events'], 'free', false, false, 'Register'],
            ['Family Painting Workshop at Mirpur', 'Mirpur', 14, '15:00', ['workshops', 'family-events'], 'paid', false, false, 'Register'],
            ['Friday Late-Night Cafe Crawl', 'Baily Road', 0, '22:00', ['food-events'], 'paid', false, false, 'Buy Tickets'],
            ['Solo Hiking Saturday at Purbachal', 'Purbachal', 4, '06:30', ['sports', 'weekend-events'], 'free', true, true, 'Register'],
            ['Studio Photography 101 at Tejgaon', 'Tejgaon', 9, '17:00', ['workshops'], 'paid', false, false, 'Register'],
            ['Food Festival at Hatirjheel', 'Hatirjheel', 21, '12:00', ['food-events', 'weekend-events'], 'paid', true, true, 'Buy Tickets'],
            ['Free Yoga in the Park — Farmgate', 'Farmgate', 6, '06:30', ['sports', 'free-events'], 'free', false, false, 'Register'],
            ['Women-Only Coding Circle at Mohammadpur', 'Mohammadpur', 11, '18:00', ['student-events', 'workshops'], 'free', false, false, 'RSVP'],
            ['Couples Cooking Class at Motijheel', 'Motijheel', 17, '19:00', ['workshops', 'food-events'], 'paid', false, false, 'Buy Tickets'],
            ['Kids-friendly Storytelling at Uttara', 'Uttara', 20, '11:30', ['family-events'], 'free', false, false, 'Register'],
            ['Community Iftar & Discussion', 'Bashundhara', 28, '18:45', ['islamic-community', 'food-events'], 'free', false, false, 'Register'],
            ['Open Mic Night at Banani', 'Banani', 24, '20:30', ['concerts'], 'paid', false, false, 'Buy Tickets'],
        ];

        foreach ($items as $item) {
            [$title, $subAreaName, $dayOffset, $time, $cats, $priceType, $isFeatured, $showInHero, $label] = $item;

            $subArea = $subAreaByName[$subAreaName] ?? $subAreaByName['Other'];
            $start = $today->copy()->addDays($dayOffset);

            // Ensure at least one event is weekend-aligned to verify the filter.
            $dayOfWeek = $start->dayOfWeek; // 0 (Sun) – 6 (Sat)
            $isWeekend = in_array($dayOfWeek, [Carbon::FRIDAY, Carbon::SATURDAY, Carbon::SUNDAY], true);

            $slug = Str::slug($title).($isWeekend ? '' : '');

            $event = Event::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'status' => EventStatus::Published->value,
                    'is_featured' => $isFeatured,
                    'show_in_hero' => $showInHero,
                    'hero_sort_order' => $isFeatured ? random_int(0, 5) : 100,

                    'organizer_name' => 'Cholo Jai Curators',
                    'organizer_phone' => '+8801711000000',
                    'organizer_email' => 'hello@cholojai.bd',
                    'organizer_website' => 'https://cholojai.bd',

                    'title' => $title,
                    'title_bn' => null,
                    'description' => "Join us for \"{$title}\" — a curated evening brought to you by Cholo Jai. Limited spots; register early.",
                    'description_bn' => null,
                    'poster_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1080&q=80',
                    'poster_alt' => 'Event cover photo — a softly lit gathering.',
                    'poster_alt_bn' => null,

                    'city_id' => $city->id,
                    'sub_area_id' => $subArea->id,
                    'venue_name' => $subAreaName.' Venue',
                    'venue_name_bn' => null,
                    'area_details' => "123 Curated Lane, {$subAreaName}",
                    'area_details_bn' => null,

                    'start_date' => $start->toDateString(),
                    'end_date' => null,
                    'start_time' => $time,

                    'price_type' => $priceType,
                    'price_min' => $priceType === 'paid' ? 200 : null,
                    'price_max' => $priceType === 'paid' ? 500 : null,
                    'price_note' => $priceType === 'paid' ? 'BDT 200–500 incl. snack.' : 'Free entry.',

                    'outbound_link' => 'https://example.com/register/'.Str::slug($title),
                    'outbound_button_label' => $label,

                    'published_at' => now()->subDays(2),
                    'starts_at' => Carbon::parse($start->toDateString().' '.$time),
                ]
            );

            // Sync categories.
            $catIds = collect($cats)->map(fn ($slug) => $catBySlug[$slug]?->id)->filter()->values()->all();
            $event->categories()->sync($catIds);
        }
    }
}
