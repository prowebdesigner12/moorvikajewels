<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppLog extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_phone', 'message_type', 'status', 'response_data'
    ];

    protected $casts = [
        'response_data' => 'array'
    ];
}

