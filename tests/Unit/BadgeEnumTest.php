<?php

namespace Tests\Unit;

use App\Enums\BadgeEnum;
use PHPUnit\Framework\TestCase;

class BadgeEnumTest extends TestCase
{
    public function test_badge_labels_match_rfc_specification(): void
    {
        $this->assertSame('Favorit', BadgeEnum::FAVORIT->label());
        $this->assertSame('Spesial', BadgeEnum::SPESIAL->label());
    }

    public function test_badge_values_are_stable_for_database_storage(): void
    {
        $this->assertSame('favorit', BadgeEnum::FAVORIT->value);
        $this->assertSame('spesial', BadgeEnum::SPESIAL->value);
    }
}
