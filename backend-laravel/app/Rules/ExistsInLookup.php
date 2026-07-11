<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates that a given value (e.g. "Dhanmondi") exists as `column` in `table`.
 * Used for sub_area matching by name and city matching by name.
 */
class ExistsInLookup implements ValidationRule
{
    public function __construct(
        private string $table,
        private string $column = 'name',
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $exists = \DB::table($this->table)
            ->whereRaw('LOWER('.$this->column.') = ?', [mb_strtolower(trim((string) $value))])
            ->exists();

        if (! $exists) {
            $fail("The selected {$attribute} is invalid.");
        }
    }
}
