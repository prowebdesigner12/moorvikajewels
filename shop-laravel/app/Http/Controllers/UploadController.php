<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        try {
            $file = $request->file('file');
            $path = $file->store('images', 'public');
            
            return response()->json([
                'success' => true,
                'url' => Storage::url($path)
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request)
    {
        $key = $request->query('key');
        if (!$key) return response()->json(['error' => 'Key required'], 400);

        // This would be for the case where we want to serve a specific key
        // But since we are using Laravel's Storage::url, we might not need this GET proxy
        // Unless the frontend specifically calls /api/upload?key=...
        // For now, let's just return the file from storage if it exists.
        
        $path = "images/{$key}";
        if (Storage::disk('public')->exists($path)) {
            return response()->file(Storage::disk('public')->path($path));
        }

        return response()->json(['error' => 'Not found'], 404);
    }
}
