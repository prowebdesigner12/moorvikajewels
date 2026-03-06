<?php

namespace App\Http\Controllers;

use App\Models\Bundle;
use App\Models\BundleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BundleController extends Controller
{
    public function index()
    {
        return response()->json(Bundle::with('items.product')->where('status', 'active')->get());
    }

    public function show($id)
    {
        $bundle = Bundle::with('items.product')->find($id);
        return $bundle ? response()->json($bundle) : response()->json(['error' => 'Bundle not found'], 404);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $bundleId = $data['id'] ?? (string) Str::uuid();

        $bundle = Bundle::updateOrCreate(
            ['id' => $bundleId],
            [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'original_price' => $data['originalPrice'] ?? null,
                'discount_label' => $data['discountLabel'] ?? null,
                'image' => $data['image'] ?? null,
                'type' => $data['type'] ?? 'fixed_combo',
                'status' => 'active'
            ]
        );

        // Clear and re-insert items
        $bundle->items()->delete();
        foreach ($data['items'] as $item) {
            BundleItem::create([
                'bundle_id' => $bundleId,
                'product_id' => $item['productId'],
                'variant_id' => $item['variantId'] ?? null,
                'quantity' => $item['quantity'] ?? 1
            ]);
        }

        return response()->json(['success' => true, 'bundleId' => $bundleId]);
    }

    public function destroy($id)
    {
        $bundle = Bundle::find($id);
        if ($bundle) {
            $bundle->items()->delete();
            $bundle->delete();
        }
        return response()->json(['success' => true]);
    }
}
