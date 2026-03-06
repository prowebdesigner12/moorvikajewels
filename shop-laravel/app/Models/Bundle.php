<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bundle extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'description', 'price', 'original_price', 
        'discount_label', 'image', 'type', 'status'
    ];

    public function items()
    {
        return $this->hasMany(BundleItem::class);
    }
}
