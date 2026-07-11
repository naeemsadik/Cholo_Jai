<?php

namespace Tests\Feature;

use App\Models\AudienceTag;
use App\Models\Category;
use App\Models\City;
use App\Models\SubArea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Tests\TestCase;

/**
 * Verifies the wire contract the frontend depends on. Touches the
 * endpoints the Next.js app actually calls.
 */
class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed minimum lookup data so /events, /submissions, and admin
        // flows work.
        $city = City::create(['name' => 'Dhaka', 'slug' => 'dhaka', 'is_active' => true]);
        SubArea::create(['city_id' => $city->id, 'name' => 'Dhanmondi', 'slug' => 'dhanmondi', 'is_active' => true]);
        Category::create(['name' => 'Workshops', 'slug' => 'workshops', 'is_active' => true, 'sort_order' => 1]);
        AudienceTag::create(['name' => 'Students', 'slug' => 'students', 'is_active' => true, 'sort_order' => 1]);
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.test',
            'password' => Hash::make('password'),
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);
    }

    public function test_get_events_returns_empty_array_when_no_published_events(): void
    {
        $this->getJson('/events')->assertOk()->assertExactJson([]);
    }

    public function test_get_lookups_returns_required_shape(): void
    {
        $r = $this->getJson('/lookups')->assertOk();
        $r->assertJsonStructure([
            'categories' => [['id', 'name', 'slug', 'icon', 'sort_order']],
            'audience_tags' => [['id', 'name', 'slug', 'sort_order']],
            'sub_areas' => [['id', 'city_id', 'name', 'slug']],
            'cities',
        ]);
    }

    public function test_404_for_nonexistent_event_slug(): void
    {
        $this->getJson('/events/nope')->assertStatus(404)
            ->assertJson(['message' => 'Event not found.']);
    }

    public function test_post_submission_with_unknown_sub_area_returns_422(): void
    {
        $payload = [
            'organizer_name' => 'X',
            'organizer_phone' => '+8801711999999',
            'title' => 'Test',
            'description' => str_repeat('a', 50),
            'poster_url' => 'https://example.com/p.jpg',
            'city' => 'Dhaka',
            'sub_area' => 'NotRealArea',
            'venue_name' => 'V',
            'area_details' => 'A',
            'start_date' => '2026-12-01',
            'price_type' => 'free',
            'outbound_link' => 'https://example.com/r',
            'categories' => ['workshops'],
        ];
        $this->postJson('/submissions', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sub_area']);
    }

    public function test_post_submission_returns_nested_organizer(): void
    {
        $payload = [
            'organizer_name' => 'Smoke Org',
            'organizer_phone' => '+8801711999999',
            'title' => 'Test',
            'description' => str_repeat('a', 50),
            'poster_url' => 'https://example.com/p.jpg',
            'city' => 'Dhaka',
            'sub_area' => 'Dhanmondi',
            'venue_name' => 'V',
            'area_details' => 'A',
            'start_date' => '2026-12-01',
            'price_type' => 'free',
            'outbound_link' => 'https://example.com/r',
            'categories' => ['workshops'],
        ];
        $r = $this->postJson('/submissions', $payload)->assertStatus(201);
        $r->assertJsonPath('organizer.phone', '+8801711999999');
        $r->assertJsonPath('review_status', 'pending');
    }

    public function test_analytics_pageview_returns_204(): void
    {
        $this->postJson('/analytics/pageview', ['path' => '/events/foo'])
            ->assertStatus(204);
    }

    public function test_admin_login_issues_token(): void
    {
        $r = $this->postJson('/admin/login', ['email' => 'admin@test.test', 'password' => 'password'])
            ->assertOk();
        $r->assertJsonStructure(['token']);
    }

    public function test_admin_events_requires_auth(): void
    {
        $this->getJson('/admin/events')->assertStatus(401);
    }

    public function test_admin_submission_review_promotes_to_event(): void
    {
        $token = auth()->guard('web')->loginUsingId(User::first()->id);
        $sanctum = User::first()->createToken('test', ['*']);
        $bearer = $sanctum->plainTextToken;

        // Public submission
        $sub = $this->postJson('/submissions', [
            'organizer_name' => 'Promote Me',
            'organizer_phone' => '+8801711999999',
            'title' => 'Promotion Smoke',
            'description' => str_repeat('a', 50),
            'poster_url' => 'https://example.com/p.jpg',
            'city' => 'Dhaka',
            'sub_area' => 'Dhanmondi',
            'venue_name' => 'V',
            'area_details' => 'A',
            'start_date' => '2026-12-01',
            'price_type' => 'free',
            'outbound_link' => 'https://example.com/r',
            'categories' => ['workshops'],
        ])->assertStatus(201)->json();

        // Approve & publish
        $r = $this->withToken($bearer)
            ->patchJson("/admin/submissions/{$sub['id']}/review", [
                'review_status' => 'approved',
                'publish' => true,
            ])->assertOk();

        $this->assertNotNull($r->json('promoted_event_id'));

        // The promoted event must show on public listing.
        $events = $this->getJson('/events')->assertOk()->json();
        $this->assertNotEmpty($events);
        $this->assertEquals('Promotion Smoke', $events[0]['title']);
        $this->assertEquals('published', $events[0]['status']);
        $this->assertNull($events[0]['organizer']['phone']); // public hides it
    }

    public function test_public_event_resource_hides_admin_notes_and_phone(): void
    {
        $city = City::first();
        $subArea = SubArea::first();
        $cat = Category::first();

        $event = \App\Models\Event::create([
            'slug' => 'admin-only-test',
            'status' => 'published',
            'is_featured' => false,
            'show_in_hero' => false,
            'hero_sort_order' => 0,
            'organizer_name' => 'Test',
            'organizer_phone' => '+880-private',
            'title' => 'Admin Test',
            'description' => 'X',
            'poster_url' => 'https://example.com/p.jpg',
            'city_id' => $city->id,
            'sub_area_id' => $subArea->id,
            'venue_name' => 'V',
            'area_details' => 'A',
            'start_date' => now()->addDays(2)->toDateString(),
            'price_type' => 'free',
            'outbound_link' => 'https://example.com/r',
            'admin_notes' => 'INTERNAL — do not expose',
            'source_link' => 'https://ig.com/p/123',
            'starts_at' => now()->addDays(2),
            'published_at' => now(),
        ]);
        $event->categories()->sync([$cat->id]);

        $r = $this->getJson('/events/'.$event->slug)->assertOk();
        $body = $r->json();
        $this->assertArrayNotHasKey('admin_notes', $body);
        $this->assertArrayNotHasKey('source_link', $body);
        $this->assertNull($body['organizer']['phone']);
    }
}
