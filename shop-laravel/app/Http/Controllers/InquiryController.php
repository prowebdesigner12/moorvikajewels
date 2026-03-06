<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InquiryController extends Controller
{
    public function index()
    {
        return response()->json(Inquiry::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $inquiry = Inquiry::create([
            'id' => (string) Str::uuid(),
            'name' => $request->name,
            'mobile' => $request->mobile,
            'date' => $request->date,
            'initial_query' => $request->initialQuery, // Mapping camelCase
            'status' => 'New'
        ]);

        return response()->json(['success' => true, 'id' => $inquiry->id]);
    }

    public function update(Request $request)
    {
        $id = $request->id;
        $inquiry = Inquiry::findOrFail($id);
        
        $inquiry->update([
            'status' => $request->status,
            'admin_notes' => $request->adminNotes // Mapping camelCase
        ]);

        return response()->json(['success' => true]);
    }
}

