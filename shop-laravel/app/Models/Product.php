<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'description', 'price', 'original_price', 'category',
        'rating', 'reviews', 'images', 'variants', 'tags', 'slug',
        'meta_title', 'meta_description', 'meta_keywords', 'status',
        'vendor', 'type', 'weight', 'stock', 'sku', 'barcode',
        'track_quantity', 'continue_selling_oos', 'wholesale_tiers'
    ];

    protected $casts = [
        'images' => 'array',
        'variants' => 'array',
        'tags' => 'array',
        'wholesale_tiers' => 'array',
        'price' => 'integer',
        'original_price' => 'integer',
        'rating' => 'float',
        'reviews' => 'integer',
        'weight' => 'float',
        'stock' => 'integer',
        'track_quantity' => 'integer',
        'continue_selling_oos' => 'integer',
    ];
}

