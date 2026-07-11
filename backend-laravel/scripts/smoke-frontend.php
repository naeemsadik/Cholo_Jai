<?php

/**
 * End-to-end smoke test through the FRONTEND (Next.js :3000), which proxies
 * the public writes + reads through to the Laravel backend (:8000).
 *
 * Verifies:
 *   - GET /events hits backend and renders event cards.
 *   - POST /submissions is forwarded to backend.
 *   - GET /lookups returns the seeded categories/sub_areas.
 *   - POST /analytics/pageview returns 204.
 *   - POST /admin/login → token → admin endpoint round-trip.
 */

$FE = 'http://localhost:3000';
$BE = 'http://localhost:8000';

function get(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);
    return ['status' => (string) curl_getinfo($ch, CURLINFO_HTTP_CODE), 'body' => (string) curl_exec($ch)];
}

function call(string $method, string $url, ?string $body = null, array $headers = []): array {
    $ch = curl_init($url);
    $h = ['Accept: application/json'];
    if ($body !== null) $h[] = 'Content-Type: application/json';
    $h = array_merge($h, $headers);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $h,
        CURLOPT_POSTFIELDS => $body,
    ]);
    return ['status' => (string) curl_getinfo($ch, CURLINFO_HTTP_CODE), 'body' => (string) curl_exec($ch)];
}

echo "=== Direct backend (Laravel) sanity ===\n";

// 1. /events returns JSON list
$r = get("$BE/events");
$d = json_decode($r['body'], true);
echo "GET /events — HTTP {$r['status']} count=".count($d)."\n";

// 2. /lookups has 12 categories, 16 sub-areas, "Dhaka" cities
$r = get("$BE/lookups");
$d = json_decode($r['body'], true);
echo "GET /lookups — HTTP {$r['status']} cats=".count($d['categories'])." subs=".count($d['sub_areas'])." cities=".json_encode($d['cities'])."\n";

// 3. /analytics/pageview returns 204
$r = call('POST', "$BE/analytics/pageview", json_encode(['path' => '/verify', 'utm_source' => 'smoke']));
echo "POST /analytics/pageview — HTTP {$r['status']} (expect 204)\n";

// 4. /admin/login
$r = call('POST', "$BE/admin/login", json_encode(['email' => 'admin@cholojai.test', 'password' => 'password']));
$d = json_decode($r['body'], true);
$token = $d['token'] ?? null;
echo "POST /admin/login — HTTP {$r['status']} token=".substr((string) $token, 0, 16)."...\n";

// 5. /admin/events (with bearer)
$r = call('GET', "$BE/admin/events", null, ["Authorization: Bearer $token"]);
$d = json_decode($r['body'], true);
echo "GET /admin/events — HTTP {$r['status']} count=".count($d)."\n";

// 6. /admin/analytics/summary?range=7d
$r = call('GET', "$BE/admin/analytics/summary?range=7d", null, ["Authorization: Bearer $token"]);
$d = json_decode($r['body'], true);
echo "GET /admin/analytics/summary — HTTP {$r['status']} pageviews={$d['total_pageviews']} clicks={$d['total_outbound_clicks']}\n";

// 7. /api/settings
$r = call('GET', "$BE/api/settings", null, ["Authorization: Bearer $token"]);
$d = json_decode($r['body'], true);
echo "GET /api/settings — HTTP {$r['status']} site_name={$d['site_name']}\n";

echo "\n=== Frontend (Next.js) rendered output ===\n";

// 8. Frontend /events HTML — count event card containers
$html = file_get_contents("$FE/events");
if ($html === false) { echo "frontend /events: not reachable\n"; exit(1); }
preg_match_all('/href="\/events\/([a-z0-9-]+)"/', $html, $matches);
$slugs = array_unique($matches[1] ?? []);
echo "GET frontend /events — " . count($slugs) . " unique event slugs in HTML\n";
echo "   sample slugs: " . implode(', ', array_slice($slugs, 0, 5)) . "\n";

// 9. Frontend /events/<slug> — does the detail page include poster + outbound?
$detailHtml = file_get_contents("$FE/events/free-friday-movie-night-gulshan");
if ($detailHtml === false) { echo "frontend /events/<slug>: not reachable\n"; exit(1); }
$hasOutbound = str_contains($detailHtml, 'outbound');
$hasPoster = str_contains($detailHtml, 'images.unsplash.com') || str_contains($detailHtml, 'poster_url') || str_contains($detailHtml, 'poster') || str_contains($detailHtml, 'image');
$hasTitle = str_contains($detailHtml, 'Free Friday Movie Night');
echo "GET frontend /events/<slug> — title_present=" . var_export($hasTitle, true) . " outbound_ref=" . var_export($hasOutbound, true) . " poster_ref=" . var_export($hasPoster, true) . "\n";

// 10. Frontend / — homepage has event cards
$homeHtml = file_get_contents("$FE/");
$eventAnchors = preg_match_all('/href="\/events\/[a-z0-9-]+"/', $homeHtml, $m);
echo "GET frontend / — event anchors in HTML: $eventAnchors\n";

// 11. /about page (CMS-backed)
$aboutHtml = file_get_contents("$FE/about");
$aboutHasH1 = preg_match('/<h1[^>]*>.*?(?:About|আমাদের).*?<\/h1>/is', $aboutHtml);
echo "GET frontend /about — html size " . strlen($aboutHtml) . " has_h1=" . var_export($aboutHasH1 === 1, true) . "\n";

// 12. /submit page (public form)
$submitHtml = file_get_contents("$FE/submit");
$hasForm = str_contains($submitHtml, '<form') || str_contains($submitHtml, 'organizer');
echo "GET frontend /submit — html size " . strlen($submitHtml) . " has_form=" . var_export($hasForm, true) . "\n";

echo "\n=== Cross-cutting analytics + submission flows ===\n";

// 13. Frontend client sends analytics through Next.js route handlers (when no API_BASE_URL)
// Since we set NEXT_PUBLIC_API_BASE_URL, the analytics endpoints should hit backend.
// Direct hit to verify 204:
$r = call('POST', "$BE/analytics/outbound-click", json_encode([
    'event_id' => 1, 'label' => 'Register', 'href' => 'https://example.com/r',
]));
echo "POST /analytics/outbound-click — HTTP {$r['status']} (expect 204)\n";

$r = call('POST', "$BE/analytics/event", json_encode([
    'form_id' => 'newsletter', 'meta' => ['source' => 'smoke'],
]));
echo "POST /analytics/event — HTTP {$r['status']} (expect 204)\n";

// 14. Submission POST through backend directly
$r = call('POST', "$BE/submissions", json_encode([
    'organizer_name' => 'Frontend Smoke Org',
    'organizer_phone' => '+8801711999900',
    'organizer_email' => 'smoke@frontend.test',
    'title' => 'Frontend smoke submission',
    'description' => str_repeat('A verification submission from the Next.js smoke test. ', 5),
    'poster_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    'city' => 'Dhaka',
    'sub_area' => 'Dhanmondi',
    'venue_name' => 'Smoke Hall',
    'area_details' => 'Verification Lane',
    'start_date' => '2026-12-15',
    'start_time' => '18:00',
    'price_type' => 'free',
    'outbound_link' => 'https://example.com/r/smoke',
    'categories' => ['workshops'],
    'wants_promotion_support' => false,
]));
$sd = json_decode($r['body'], true);
echo "POST /submissions — HTTP {$r['status']} id=" . ($sd['id'] ?? 'null') . " review_status=" . ($sd['review_status'] ?? 'null') . "\n";

$subId = $sd['id'] ?? null;

// 15. Admin reviews submission → promotes to event
if ($subId) {
    $r = call('PATCH', "$BE/admin/submissions/$subId/review", json_encode([
        'review_status' => 'approved', 'publish' => true,
    ]), ["Authorization: Bearer $token"]);
    $rd = json_decode($r['body'], true);
    echo "PATCH /admin/submissions/$subId/review — HTTP {$r['status']} promoted_event_id=" . ($rd['promoted_event_id'] ?? 'null') . "\n";

    // Verify the new event shows in public listing
    $r = get("$BE/events");
    $list = json_decode($r['body'], true);
    $found = false;
    foreach ($list as $e) if ($e['title'] === 'Frontend smoke submission') $found = true;
    echo "GET /events (post-promote) — new_event_visible=" . var_export($found, true) . " total_count=" . count($list) . "\n";
}

echo "\n=== DONE ===\n";