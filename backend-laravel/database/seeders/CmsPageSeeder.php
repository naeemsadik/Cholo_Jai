<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about',
                'title' => 'About Cholo Jai',
                'blocks' => [
                    ['kind' => 'heading', 'level' => 1, 'text' => ['en' => 'About Cholo Jai', 'bn' => 'চলো যাই সম্পর্কে']],
                    ['kind' => 'paragraph', 'text' => ['en' => 'Cholo Jai helps you discover events worth going to in Bangladesh — starting with Dhaka. We curate, you show up.', 'bn' => null]],
                ],
                'published' => true,
            ],
            [
                'slug' => 'terms',
                'title' => 'Terms of Service',
                'blocks' => [
                    ['kind' => 'heading', 'level' => 1, 'text' => ['en' => 'Terms of Service', 'bn' => null]],
                    ['kind' => 'paragraph', 'text' => ['en' => 'By using Cholo Jai, you agree to these terms. Event listings are curated; we are not responsible for the events themselves.', 'bn' => null]],
                ],
                'published' => true,
            ],
            [
                'slug' => 'privacy',
                'title' => 'Privacy Policy',
                'blocks' => [
                    ['kind' => 'heading', 'level' => 1, 'text' => ['en' => 'Privacy Policy', 'bn' => null]],
                    ['kind' => 'paragraph', 'text' => ['en' => 'We collect pageview and click telemetry to improve curation. Subscribe emails are never sold.', 'bn' => null]],
                ],
                'published' => true,
            ],
            [
                'slug' => 'faq',
                'title' => 'Frequently Asked Questions',
                'blocks' => [
                    ['kind' => 'heading', 'level' => 1, 'text' => ['en' => 'FAQ', 'bn' => null]],
                    ['kind' => 'faq', 'items' => [
                        ['q' => ['en' => 'How are events curated?', 'bn' => null], 'a' => ['en' => 'Manually, by a small editorial team.', 'bn' => null]],
                        ['q' => ['en' => 'How do I submit my event?', 'bn' => null], 'a' => ['en' => 'Use the Submit Your Event form.', 'bn' => null]],
                    ]],
                ],
                'published' => true,
            ],
        ];

        // Convert blocks shape from {kind, text} to {id, type, content}.
        foreach ($pages as $p) {
            $blocks = [];
            foreach ($p['blocks'] as $i => $b) {
                $blocks[] = [
                    'id' => 'block-'.($i + 1),
                    'type' => $b['kind'],
                    'content' => match ($b['kind']) {
                        'heading' => ['text' => $b['text']['en'] ?? '', 'bn' => $b['text']['bn'] ?? null, 'level' => $b['level'] ?? 2],
                        'paragraph' => ['text' => $b['text']['en'] ?? '', 'bn' => $b['text']['bn'] ?? null],
                        'faq' => ['items' => array_map(fn ($it) => [
                            'q' => $it['q']['en'] ?? '',
                            'a' => $it['a']['en'] ?? '',
                        ], $b['items'])],
                        default => $b,
                    },
                ];
            }

            CmsPage::query()->updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'blocks' => $blocks,
                    'published' => $p['published'],
                ]
            );
        }
    }
}
