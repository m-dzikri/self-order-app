<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_UNPAID_CASHIER = 'unpaid_cashier';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_READY = 'ready';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const PAYMENT_QRIS = 'qris';

    public const PAYMENT_EWALLET = 'ewallet';

    public const PAYMENT_CASHIER = 'kasir';

    protected $fillable = [
        'user_id',
        'order_code',
        'session_type',
        'table_number',
        'customer_name',
        'customer_phone',
        'pickup_time',
        'payment_method',
        'snap_token',
        'payment_gateway_status',
        'payment_type',
        'status',
        'paid_at',
        'subtotal',
        'discount',
        'coupon_code',
        'pb1_tax',
        'total',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'discount' => 'integer',
        'pb1_tax' => 'integer',
        'total' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
