<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_id', 'code', 'type', 'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime'
    ];
}

