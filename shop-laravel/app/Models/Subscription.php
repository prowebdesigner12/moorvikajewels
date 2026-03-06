<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_phone', 'product_id', 'variant_id', 
        'frequency', 'next_billing_date', 'status'
    ];

    protected $casts = [
        'next_billing_date' => 'datetime'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
