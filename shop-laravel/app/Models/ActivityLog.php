<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'customer_id', 'action', 'description', 'metadata'];

    protected $casts = [
        'metadata' => 'json'
    ];
}
