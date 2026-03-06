<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function index()
    {
        return response()->json(Collection::all());
    }

    public function store(Request $request)
    {
        $id = (string) Str::uuid();
        $collection = Collection::create(array_merge($request->all(), [
            'id' => $id,
            'slug' => $request->slug ?? $id
        ]));
        return response()->json(['success' => true, 'id' => $id]);
    }

    public function show($id)
    {
        return response()->json(Collection::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);
        $collection->update($request->all());
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();
        return response()->json(['success' => true]);
    }
}

