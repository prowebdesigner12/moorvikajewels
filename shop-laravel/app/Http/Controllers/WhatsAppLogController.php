<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WhatsAppLogController extends Controller
{
    public function index()
    {
        return response()->json(WhatsAppLog::orderBy('created_at', 'desc')->get());
    }

    public function webhook(Request $request)
    {
        // 1. Webhook Verification
        if ($request->isMethod('get')) {
            $mode = $request->query('hub_mode');
            $token = $request->query('hub_verify_token');
            $challenge = $request->query('hub_challenge');

            if ($mode && $token) {
                if ($mode === 'subscribe' && $token === config('services.whatsapp.verify_token')) {
                    return response($challenge, 200);
                }
            }
            return response('Forbidden', 403);
        }

        // 2. Handle Incoming Messages
        $data = $request->all();
        
        if (isset($data['entry'][0]['changes'][0]['value']['messages'][0])) {
            $message = $data['entry'][0]['changes'][0]['value']['messages'][0];
            $from = $message['from'];
            $text = $message['text']['body'] ?? '';

            WhatsAppLog::create([
                'id' => (string) Str::uuid(),
                'customer_phone' => $from,
                'message_type' => 'incoming',
                'status' => 'received',
                'response_data' => $data
            ]);

            \Log::info("WhatsApp Message from $from: $text");
        }

        return response()->json(['status' => 'ok']);
    }
}

