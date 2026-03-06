<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        NewsletterSubscriber::updateOrCreate(['email' => $request->email]);

        return response()->json([
            'success' => true, 
            'message' => 'Subscribed successfully'
        ]);
    }
}
