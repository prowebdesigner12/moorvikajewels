<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BundleItem extends Model
{
    protected $fillable = [
        'bundle_id', 'product_id', 'variant_id', 'quantity'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
