<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private const ALGOLIA_ID = "149SUVKCWZ";
    private const ALGOLIA_KEY = "2b04beb301fe738a0dc4e8fe97605e77";

    private function updateAlgolia($product, $isDelete = false)
    {
        try {
            $client = \Algolia\AlgoliaSearch\SearchClient::create(self::ALGOLIA_ID, self::ALGOLIA_KEY);
            $index = $client->initIndex('products');

            if ($isDelete) {
                $index->deleteObject($product->id);
                return;
            }

            $record = [
                'objectID' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'image' => (is_array($product->images) && count($product->images) > 0) ? $product->images[0] : null,
                'category' => $product->category,
                'tags' => $product->tags,
                'slug' => $product->slug ?: $product->id,
                'rating' => $product->rating ?: 0,
                'reviews' => $product->reviews ?: 0
            ];

            $index->saveObject($record);
        } catch (\Exception $e) {
            \Log::error("Algolia Sync Error: " . $e->getMessage());
        }
    }

    public function index(Request $request)
    {
        $id = $request->query('id');
        $slug = $request->query('slug');

        if ($id) {
            $product = Product::find($id);
            return $product ? response()->json($product) : response()->json(['error' => 'Not found'], 404);
        }

        if ($slug) {
            $product = Product::where('slug', $slug)->first();
            return $product ? response()->json($product) : response()->json(['error' => 'Not found'], 404);
        }

        return response()->json(Product::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $id = (string) Str::uuid();
        
        $product = Product::create(array_merge($data, [
            'id' => $id,
            'slug' => $data['slug'] ?? $id,
        ]));

        $this->updateAlgolia($product);

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function show($id)
    {
        $product = Product::find($id);
        return $product ? response()->json($product) : response()->json(['error' => 'Not found'], 404);
    }

    public function update(Request $request, $id = null)
    {
        $data = $request->all();
        $productId = $id ?: $data['id'] ?? null;

        if (!$productId) return response()->json(['error' => 'ID required'], 400);

        $product = Product::find($productId);
        if (!$product) return response()->json(['error' => 'Not found'], 404);

        $product->update($data);
        $this->updateAlgolia($product);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id = null)
    {
        $productId = $id ?: $request->query('id');
        if (!$productId) return response()->json(['error' => 'ID required'], 400);

        $product = Product::find($productId);
        if ($product) {
            $this->updateAlgolia($product, true);
            $product->delete();
        }

        return response()->json(['success' => true]);
    }
}

