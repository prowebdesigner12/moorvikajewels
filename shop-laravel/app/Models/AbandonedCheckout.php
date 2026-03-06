<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbandonedCheckout extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_email', 'customer_phone', 'cart_data',
        'total_amount', 'notification_sent_at', 'reminder_count'
    ];

    protected $casts = [
        'cart_data' => 'array',
        'total_amount' => 'float',
        'notification_sent_at' => 'datetime',
        'reminder_count' => 'integer'
    ];
}

