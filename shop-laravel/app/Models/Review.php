<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'product_id', 'customer_name', 'rating', 'comment', 'status'
    ];

    protected $casts = [
        'rating' => 'integer'
    ];
}

