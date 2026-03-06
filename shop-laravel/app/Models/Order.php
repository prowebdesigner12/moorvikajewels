<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'customer_name', 'customer_email', 'customer_phone',
        'address', 'city', 'pincode', 'total_amount',
        'payment_method', 'payment_status', 'status',
        'razorpay_order_id', 'razorpay_payment_id',
        'shiprocket_order_id', 'shiprocket_shipment_id',
        'company_name', 'gst_number', 'pickup_location'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}

