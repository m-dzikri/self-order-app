<?php

namespace App\Models;

use App\Enums\BadgeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'image_path',
        'badge',
        'is_active',
        'is_in_stock',
    ];

    protected $casts = [
        'price' => 'integer',
        'badge' => BadgeEnum::class, // nullable enum casting
        'is_active' => 'boolean',
        'is_in_stock' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function modifiers(): HasMany
    {
        return $this->hasMany(MenuModifier::class);
    }
}
