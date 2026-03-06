<?php

namespace App\Http\Controllers;

use App\Models\AbandonedCheckout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AbandonedCheckoutController extends Controller
{
    public function index()
    {
        return response()->json(AbandonedCheckout::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $email = $request->email;
        $phone = $request->phone;

        // Try to find an existing abandoned checkout from the last 24 hours
        $existing = AbandonedCheckout::where(function($query) use ($email, $phone) {
                if ($email) $query->where('customer_email', $email);
                if ($phone) $query->orWhere('customer_phone', $phone);
            })
            ->where('created_at', '>', now()->subDay())
            ->where('status', '!=', 'recovered')
            ->first();

        if ($existing) {
            $existing->update([
                'customer_name' => $request->name ?? $existing->customer_name,
                'customer_email' => $email ?? $existing->customer_email,
                'customer_phone' => $phone ?? $existing->customer_phone,
                'items' => json_encode($request->items),
                'total_amount' => $request->totalAmount ?? $existing->total_amount
            ]);
            return response()->json(['success' => true, 'id' => $existing->id]);
        }

        $id = (string) Str::uuid();
        $checkout = AbandonedCheckout::create([
            'id' => $id,
            'customer_name' => $request->name,
            'customer_email' => $email,
            'customer_phone' => $phone,
            'items' => json_encode($request->items),
            'total_amount' => $request->totalAmount,
            'status' => 'pending'
        ]);

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function show($id)
    {
        return response()->json(AbandonedCheckout::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $checkout = AbandonedCheckout::findOrFail($id);
        $checkout->update($request->all());
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        AbandonedCheckout::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function recover(Request $request)
    {
        $checkout = AbandonedCheckout::findOrFail($request->cartId);
        
        $notification = new \App\Services\NotificationService();
        $success = $notification->sendWhatsAppMessage(
            $checkout->customer_phone,
            'abandoned_cart_reminder',
            'abandoned_cart', // Template name
            [
                ['type' => 'text', 'text' => $checkout->customer_name ?? 'there'],
                ['type' => 'text', 'text' => 'https://moorvikajewels.com/checkout?recovered_id=' . $checkout->id]
            ]
        );

        if ($success) {
            $checkout->increment('reminder_count');
            $checkout->update(['notification_sent_at' => now()]);
        }

        return $success 
            ? response()->json(['success' => true])
            : response()->json(['error' => 'Failed to send WhatsApp'], 500);
    }
}

