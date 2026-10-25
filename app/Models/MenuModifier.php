<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuModifier extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id',
        'type',
        'name',
        'extra_price',
    ];

    protected $casts = [
        'extra_price' => 'integer',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}
