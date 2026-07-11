<?php

/**
 * Smoke test runner. Hits the live Laravel dev server and inspects JSON.
 */

$base = $argv[1] ?? 'http://localhost:8000';

function call(string $method, string $path, ?string $body = null, ?string $token = null, string $base = 'http://localhost:8000'): array
{
    $ch = curl_init($base.$path);
    $headers = ['Accept: application/json'];
    if ($body) {
        $headers[] = 'Content-Type: application/json';
    }
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_HEADER => false,
    ]);
    if ($body) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => (string) $status, 'body' => (string) $resp];
}

function show_count(string $label, array $r): void
{
    $j = json_decode($r['body'], true);
    $count = is_array($j) ? count($j) : '?';
    echo "{$label} — HTTP {$r['status']} count={$count}\n";
    return;
}

// 1) GET /events
$r = call('GET', '/events');
$j = json_decode($r['body'], true);
echo "1) GET /events — HTTP {$r['status']} count=".(is_array($j) ? count($j) : '?')."\n";
if (is_array($j) && ! empty($j)) {
    $first = $j[0];
    echo "   first.slug={$first['slug']}\n";
    echo "   first.status={$first['status']}\n";
    echo "   first.organizer.phone=".var_export($first['organizer']['phone'], true)." (expect NULL on public)\n";
    echo "   has admin_notes? ".var_export(array_key_exists('admin_notes', $first), true)." (expect false)\n";
    echo "   categories=".json_encode($first['categories'])."\n";
}

echo "\n";

// 2) GET /events?city=Dhaka
$r = call('GET', '/events?city=Dhaka');
show_count('2) /events?city=Dhaka', $r);

echo "\n";

// 3) GET /events/hero
$r = call('GET', '/events/hero');
$j = json_decode($r['body'], true);
echo "3) /events/hero — HTTP {$r['status']} count=".(is_array($j) ? count($j) : '?')."\n";
if (is_array($j) && ! empty($j)) echo "   first.title={$j[0]['title']}\n";

echo "\n";

// 4) GET /events/nonexistent-slug
$r = call('GET', '/events/nonexistent-slug');
echo "4) /events/nonexistent-slug — HTTP {$r['status']} (expect 404)\n";

echo "\n";

// 5) GET /lookups
$r = call('GET', '/lookups');
$j = json_decode($r['body'], true);
echo "5) /lookups — HTTP {$r['status']}\n";
if (is_array($j)) {
    echo "   categories=".count($j['categories'] ?? [])."\n";
    echo "   audience_tags=".count($j['audience_tags'] ?? [])."\n";
    echo "   sub_areas=".count($j['sub_areas'] ?? [])."\n";
    echo "   cities=".json_encode($j['cities'] ?? [])."\n";
}

echo "\n";

// 6) Weekend
$r = call('GET', '/events?weekend=true');
show_count('6) /events?weekend=true', $r);

echo "\n";

// 7) Featured
$r = call('GET', '/events?featured=true');
show_count('7) /events?featured=true', $r);

echo "\n";

// 8) Search
$r = call('GET', '/events?search=design');
show_count('8) /events?search=design', $r);

echo "\n";

// 9) Filter by category
$r = call('GET', '/events?category=workshops');
show_count('9) /events?category=workshops', $r);

echo "\n";

// 10) Filter by sub_area
$r = call('GET', '/events?sub_area=Dhanmondi');
show_count('10) /events?sub_area=Dhanmondi', $r);

echo "\n";

// 11) Filter by free
$r = call('GET', '/events?price_type=free');
show_count('11) /events?price_type=free', $r);

echo "\n";

// 12) Filter by paid
$r = call('GET', '/events?price_type=paid');
show_count('12) /events?price_type=paid', $r);
