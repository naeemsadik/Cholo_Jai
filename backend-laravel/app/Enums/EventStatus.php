<?php

namespace App\Enums;

/**
 * Event status — exact values per PUKU.local.md and PRD.
 * These values are stored as VARCHAR strings (not a MySQL ENUM) for portability.
 */
enum EventStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Published = 'published';
    case Unpublished = 'unpublished';
    case Archived = 'archived';
    case Rejected = 'rejected';

    /**
     * The only status visible on the public site.
     */
    public const PUBLIC_VISIBLE = 'published';

    /**
     * Default transitions per PRD/admin UI flow.
     *
     * @return array<string, list<string>>
     */
    public static function transitions(): array
    {
        return [
            'draft' => ['published', 'submitted', 'rejected', 'archived'],
            'submitted' => ['published', 'rejected', 'archived'],
            'published' => ['unpublished', 'archived'],
            'unpublished' => ['published', 'archived'],
            'archived' => ['draft', 'published'],
            'rejected' => ['draft', 'archived'],
        ];
    }
}
