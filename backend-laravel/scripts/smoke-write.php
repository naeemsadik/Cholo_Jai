<?php

/**
 * Smoke test for public writes, analytics, and admin auth + CRUD + submission
 * promotion flow.
 */

$base = 'http://localhost:8000';

function call(string $method, string $path, ?string $body = null, ?string $token = null): array
{
    $ch = curl_init($GLOBALS['base'].$path);
    $headers = ['Accept: application/json'];
    if ($body) $headers[] = 'Content-Type: application/json';
    if ($token) $headers[] = "Authorization: Bearer $token";
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => (string) $status, 'body' => (string) $resp];
}

echo "=== Public writes ===\n";

// ── POST /submissions ──
$sub = json_encode([
    'organizer_name' => 'Acme Studio',
    'organizer_phone' => '+8801711999999',
    'organizer_email' => 'hello@acme.test',
    'title' => 'Test Event for Smoke Run',
    'description' => 'A long enough description for the smoke test. Must exceed thirty chars.',
    'poster_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    'city' => 'Dhaka',
    'sub_area' => 'Dhanmondi',
    'venue_name' => 'Acme Hall',
    'area_details' => '12 Smoke Lane',
    'start_date' => '2026-12-01',
    'start_time' => '18:30',
    'price_type' => 'free',
    'outbound_link' => 'https://example.com/r/test',
    'categories' => ['workshops'],
]);

$r = call('POST', '/submissions', $sub);
echo "POST /submissions — HTTP {$r['status']}\n";
$subJson = json_decode($r['body'], true);
echo "   id=" . ($subJson['id'] ?? 'null') . "\n";
echo "   organizer.phone=" . ($subJson['organizer']['phone'] ?? 'null') . "\n";

echo "\n";

// ── POST /subscribers ──
$r = call('POST', '/subscribers', json_encode(['email' => 'demo+'.time().'@example.com']));
echo "POST /subscribers — HTTP {$r['status']}\n";
echo "   body=" . substr($r['body'], 0, 120) . "\n";

echo "\n";

// ── POST /submissions with unknown sub_area (expect 422) ──
$r = call('POST', '/submissions', json_encode([
    'organizer_name' => 'X', 'organizer_phone' => '+880000000000',
    'title' => 'Reject me', 'description' => str_repeat('a', 50),
    'poster_url' => 'https://example.com/p.jpg',
    'city' => 'Dhaka', 'sub_area' => 'NotARealSubArea', 'venue_name' => 'V', 'area_details' => 'A',
    'start_date' => '2026-12-15', 'price_type' => 'free', 'outbound_link' => 'https://example.com/r',
    'categories' => ['workshops'],
]));
echo "POST /submissions (bad sub_area) — HTTP {$r['status']} (expect 422)\n";
echo "   first error: " . (json_decode($r['body'], true)['errors']['sub_area'][0] ?? 'none') . "\n";

echo "\n=== Analytics ===\n";

// ── POST /analytics/pageview ──
$r = call('POST', '/analytics/pageview', json_encode([
    'path' => '/events/test', 'utm_source' => 'instagram',
]), null);
echo "POST /analytics/pageview — HTTP {$r['status']} (expect 204)\n";

$r = call('POST', '/analytics/pageview', json_encode([
    'path' => '/events',
]), null);
echo "POST /analytics/pageview (no session) — HTTP {$r['status']} (expect 204 even without session)\n";

// ── POST /analytics/outbound-click (need a real event id) ──
$firstEventId = json_decode(call('GET', '/events')['body'], true)[0]['id'] ?? null;
$r = call('POST', '/analytics/outbound-click', json_encode([
    'event_id' => $firstEventId, 'label' => 'Register', 'href' => 'https://example.com/r',
]), null);
echo "POST /analytics/outbound-click — HTTP {$r['status']} (expect 204)\n";

// ── POST /analytics/event ──
$r = call('POST', '/analytics/event', json_encode(['form_id' => 'newsletter']), null);
echo "POST /analytics/event — HTTP {$r['status']} (expect 204)\n";

echo "\n=== Admin auth ===\n";

// ── POST /admin/login (no auth) ──
$r = call('POST', '/admin/login', json_encode(['email' => 'admin@cholojai.test', 'password' => 'password']));
echo "POST /admin/login — HTTP {$r['status']}\n";
$loginJson = json_decode($r['body'], true);
$token = $loginJson['token'] ?? null;
echo "   token starts: " . substr((string) $token, 0, 16) . "...\n";

if (! $token) {
    echo "FATAL: no token issued; cannot continue admin tests.\n";
    exit(1);
}

echo "\n=== Admin CRUD ===\n";

// ── GET /admin/events ──
$r = call('GET', '/admin/events', null, $token);
$events = json_decode($r['body'], true);
echo "GET /admin/events — HTTP {$r['status']} count=" . count($events) . "\n";
echo "   first.admin_notes (admin): " . var_export($events[0]['admin_notes'] ?? 'NOT_PRESENT', true) . "\n";
echo "   first.organizer.phone (admin): " . ($events[0]['organizer']['phone'] ?? 'NULL') . "\n";

echo "\n";

// ── POST /admin/events ──
$payload = json_encode([
    'title' => 'Curl-Created Event',
    'description' => 'Description of curl-created event used for smoke testing the admin CRUD flow.',
    'poster_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    'city' => 'Dhaka',
    'sub_area' => 'Gulshan',
    'venue_name' => 'Smoke Hall',
    'area_details' => '99 Admin Street',
    'start_date' => '2026-12-05',
    'start_time' => '19:00',
    'price_type' => 'paid',
    'price_min' => 100, 'price_max' => 300, 'price_note' => 'Tier pricing',
    'outbound_link' => 'https://example.com/r/curl',
    'organizer_name' => 'Curl Org',
    'organizer_phone' => '+8801711222333',
    'status' => 'published',
    'categories' => ['workshops'],
]);
$r = call('POST', '/admin/events', $payload, $token);
$created = json_decode($r['body'], true);
$newId = $created['id'] ?? null;
echo "POST /admin/events — HTTP {$r['status']}\n";
echo "   id=" . ($newId ?? 'null') . " slug=" . ($created['slug'] ?? 'null') . "\n";

if (! $newId) {
    echo "FATAL: create failed; cannot continue.\n";
    var_dump($created);
    exit(1);
}

echo "\n";

// ── PATCH /admin/events/{id}/status ──
$r = call('PATCH', "/admin/events/{$newId}/status", json_encode(['status' => 'unpublished']), $token);
echo "PATCH /admin/events/{$newId}/status — HTTP {$r['status']}\n";
echo "   new status=" . (json_decode($r['body'], true)['status'] ?? '?') . "\n";

echo "\n";

// ── PATCH /admin/events/{id} ──
$r = call('PATCH', "/admin/events/{$newId}", json_encode([
    'description' => 'Updated description text via PATCH smoke test.',
    'is_featured' => true,
]), $token);
echo "PATCH /admin/events/{$newId} — HTTP {$r['status']}\n";
echo "   is_featured=" . var_export(json_decode($r['body'], true)['is_featured'] ?? null, true) . "\n";

echo "\n";

// ── POST /admin/uploads ──
// We need a tiny file. Create it on the fly.
$tmp = tempnam(sys_get_temp_dir(), 'img').'.jpg';
file_put_contents($tmp, base64_decode(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AB//Z'
));
$r = call('POST', '/admin/uploads', null, $token);
curl_setopt_array($ch = curl_init($base.'/admin/uploads'), [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Accept: application/json', "Authorization: Bearer $token"],
    CURLOPT_POSTFIELDS => ['file' => new \CURLFile($tmp, 'image/jpeg', 'poster.jpg')],
]);
$resp = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$uploadJson = json_decode($resp, true);
echo "POST /admin/uploads — HTTP {$$status} (expect 201)\n";
echo "   url=" . ($uploadJson['url'] ?? 'null') . "\n";

echo "\n";

// ── GET /admin/analytics/summary ──
$r = call('GET', '/admin/analytics/summary?range=7d', null, $token);
$s = json_decode($r['body'], true);
echo "GET /admin/analytics/summary — HTTP {$r['status']}\n";
echo "   total_pageviews={$s['total_pageviews']} total_outbound_clicks={$s['total_outbound_clicks']} unique_sessions={$s['unique_sessions']}\n";

echo "\n";

// ── Settings + CMS ──
$r = call('GET', '/api/settings', null, $token);
echo "GET /api/settings — HTTP {$r['status']} site_name=" . (json_decode($r['body'], true)['site_name'] ?? '?') . "\n";

$r = call('GET', '/api/cms/home', null, $token);
echo "GET /api/cms/home — HTTP {$r['status']} order=" . count(json_decode($r['body'], true)['order'] ?? []) . "\n";

echo "\n";

// ── Submission review / promotion ──
$r = call('GET', '/admin/submissions', null, $token);
$subs = json_decode($r['body'], true);
echo "GET /admin/submissions — HTTP {$r['status']} count=" . count($subs) . "\n";
$firstSub = $subs[0];
echo "   first.id={$firstSub['id']} title=" . substr($firstSub['title'], 0, 30) . "\n";

$r = call('PATCH', "/admin/submissions/{$firstSub['id']}/review", json_encode([
    'review_status' => 'approved', 'publish' => true,
]), $token);
$reviewJson = json_decode($r['body'], true);
echo "PATCH /admin/submissions/{$firstSub['id']}/review — HTTP {$r['status']}\n";
echo "   promoted_event_id=" . ($reviewJson['promoted_event_id'] ?? 'null') . "\n";

// Verify the new event shows in public listings.
$r = call('GET', '/events');
$pubEvents = json_decode($r['body'], true);
echo "GET /events — HTTP {$r['status']} (post-promo) count=" . count($pubEvents) . "\n";

echo "\n";

// ── DELETE /admin/events/{id} ──
$r = call('DELETE', "/admin/events/{$newId}", null, $token);
echo "DELETE /admin/events/{$newId} — HTTP {$r['status']} body=" . $r['body'] . "\n";

echo "\n=== DONE ===\n";
