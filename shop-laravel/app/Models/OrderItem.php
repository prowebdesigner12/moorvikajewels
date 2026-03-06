<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'order_id', 'product_id', 'variant_id',
        'product_name', 'quantity', 'price', 'image'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

