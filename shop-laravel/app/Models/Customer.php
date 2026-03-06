<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'email', 'phone', 'password', 'status', 'is_verified'
    ];

    protected $hidden = [
        'password'
    ];

    protected $casts = [
        'is_verified' => 'integer'
    ];
}

