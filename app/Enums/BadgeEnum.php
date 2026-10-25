<?php

namespace App\Enums;

enum BadgeEnum: string
{
    case FAVORIT = 'favorit';
    case SPESIAL = 'spesial';

    public function label(): string
    {
        return match ($this) {
            self::FAVORIT => 'Favorit',
            self::SPESIAL => 'Spesial',
        };
    }
}
