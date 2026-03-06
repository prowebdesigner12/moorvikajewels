<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $productId = $request->query('productId'); // Frontend uses productId
        if ($productId) {
            return response()->json(Review::where('product_id', $productId)->get());
        }
        return response()->json(Review::all());
    }

    public function store(Request $request)
    {
        $review = Review::create([
            'id' => (string) Str::uuid(),
            'product_id' => $request->productId,
            'customer_name' => $request->customerName,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending'
        ]);
        return response()->json(['success' => true, 'id' => $review->id]);
    }

    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->update($request->only(['status']));
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}

