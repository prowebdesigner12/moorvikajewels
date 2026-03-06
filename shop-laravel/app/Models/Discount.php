<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'code', 'type', 'value', 'status', 'usage_limit',
        'min_amount', 'starts_at', 'ends_at', 'used_count',
        'is_referral', 'referrer_id'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'value' => 'float',
        'usage_limit' => 'integer',
        'min_amount' => 'float',
        'used_count' => 'integer',
        'is_referral' => 'boolean',
        'referrer_id' => 'string'
    ];
}
