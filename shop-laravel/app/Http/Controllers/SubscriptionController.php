<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $phone = $request->query('phone');
        if (!$phone) return response()->json(['error' => 'Phone required'], 400);

        $subscriptions = Subscription::with('product')
            ->where('customer_phone', $phone)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($subscriptions);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $id = (string) Str::uuid();
        
        $now = now();
        $nextBilling = now();

        if ($data['frequency'] === 'weekly') $nextBilling->addWeeks(1);
        else if ($data['frequency'] === 'monthly') $nextBilling->addMonths(1);
        else if ($data['frequency'] === 'quarterly') $nextBilling->addMonths(3);

        $subscription = Subscription::create([
            'id' => $id,
            'customer_phone' => $data['phone'],
            'product_id' => $data['productId'],
            'variant_id' => $data['variantId'] ?? null,
            'frequency' => $data['frequency'],
            'next_billing_date' => $nextBilling,
            'status' => 'active'
        ]);

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);
        $subscription->update(['status' => $request->status]);
        return response()->json(['success' => true]);
    }
}
