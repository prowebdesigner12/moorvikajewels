<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $data = $request->all();
            $messages = $data['messages'];
            $textToSend = $data['textToSend'];
            $systemPrompt = $data['systemPrompt'];
            
            $apiKey = "AIzaSyCET7b5jpD_wl95pl7hvMLlfRfXYTiVKdI"; // Ported from Node.js
            
            $contents = [];
            foreach ($messages as $m) {
                if (($m['id'] ?? '') === '1') continue;
                $contents[] = [
                    'role' => ($m['role'] ?? '') === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $m['text'] ?? '']]
                ];
            }
            
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => "{$systemPrompt}\n\nQuestion: {$textToSend}"]]
            ];

            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}", [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 1024
                ]
            ]);

            if ($response->successful()) {
                $resData = $response->json();
                $aiText = $resData['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($aiText) {
                    return response()->json(['text' => $aiText]);
                }
            }

            return response()->json(['error' => 'AI failed to respond'], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
