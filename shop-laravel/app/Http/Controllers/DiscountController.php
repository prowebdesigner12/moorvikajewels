<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $code = $request->query('code');
        if ($code) {
            $discount = Discount::where('code', $code)
                ->where('status', 'active')
                ->where(function ($query) {
                    $query->whereNull('ends_at')
                        ->orWhere('ends_at', '>', now());
                })
                ->first();

            if (!$discount) {
                return response()->json(['error' => 'Invalid or expired coupon code'], 404);
            }

            if ($discount->usage_limit && $discount->used_count >= $discount->usage_limit) {
                return response()->json(['error' => 'Coupon usage limit reached'], 400);
            }

            return response()->json($discount);
        }
        return response()->json(Discount::all());
    }

    public function store(Request $request)
    {
        $id = (string) Str::uuid();
        $discount = Discount::create(array_merge($request->all(), [
            'id' => $id
        ]));
        return response()->json(['success' => true, 'id' => $id]);
    }

    public function show($id)
    {
        return response()->json(Discount::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $discount = Discount::findOrFail($id);
        $discount->update($request->all());
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        Discount::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}

