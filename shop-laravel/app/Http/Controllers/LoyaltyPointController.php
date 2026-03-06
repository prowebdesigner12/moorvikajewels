<?php

namespace App\Http\Controllers;

use App\Models\LoyaltyPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LoyaltyPointController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        if ($userId) {
            $points = LoyaltyPoint::where('user_id', $userId)->get();
            $total = LoyaltyPoint::where('user_id', $userId)->sum('points');
            return response()->json([
                'total' => $total,
                'transactions' => $points
            ]);
        }
        return response()->json(LoyaltyPoint::all());
    }

    public function store(Request $request)
    {
        $loyaltyPoint = LoyaltyPoint::create(array_merge($request->all(), [
            'id' => (string) Str::uuid()
        ]));
        return response()->json(['success' => true, 'id' => $loyaltyPoint->id]);
    }
}

