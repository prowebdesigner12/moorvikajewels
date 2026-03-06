<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\WhatsAppLog;
use Illuminate\Support\Str;

class NotificationService
{
    protected $brevoApiKey;
    protected $razorpaySecret;

    public function __construct()
    {
        $this->brevoApiKey = config('services.brevo.key');
        $this->razorpaySecret = config('services.razorpay.secret');
    }

    public function sendEmail($to, $subject, $html)
    {
        try {
            Http::withHeaders([
                'api-key' => $this->brevoApiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => ['name' => 'TopStore', 'email' => 'no-reply@moorvikajewels.com'],
                'to' => [['email' => $to]],
                'subject' => $subject,
                'htmlContent' => $html
            ]);
        } catch (\Exception $e) {
            \Log::error("Email Error: " . $e->getMessage());
        }
    }

    public function sendWhatsAppMessage($phone, $type, $templateName, $parameters = [])
    {
        try {
            $token = config('services.whatsapp.token');
            $phoneId = config('services.whatsapp.phone_id');
            $bridgeUrl = config('services.whatsapp.bridge_url');

            $data = [
                'messaging_product' => 'whatsapp',
                'to' => $phone,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => ['code' => 'en'],
                    'components' => [
                        [
                            'type' => 'body',
                            'parameters' => $parameters
                        ]
                    ]
                ]
            ];

            // Try local bridge first if configured
            $response = null;
            if ($bridgeUrl) {
                try {
                    $response = Http::post($bridgeUrl . '/api/send', [
                        'to' => $phone,
                        'templateName' => $templateName,
                        'parameters' => $parameters
                    ]);
                } catch (\Exception $e) {
                    \Log::warning("WhatsApp Bridge Failed: " . $e->getMessage());
                }
            }

            // Fallback to direct Meta API
            if (!$response || $response->failed()) {
                $response = Http::withToken($token)
                    ->post("https://graph.facebook.com/v17.0/{$phoneId}/messages", $data);
            }

            WhatsAppLog::create([
                'id' => (string) Str::uuid(),
                'customer_phone' => $phone,
                'message_type' => $type,
                'status' => $response->successful() ? 'sent' : 'failed',
                'response_data' => $response->json()
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            \Log::error("WhatsApp Error: " . $e->getMessage());
            return false;
        }
    }

    public function orderConfirmationTemplate($orderId, $total)
    {
        return "<h1>Order Confirmation</h1><p>Thank you for your order #{$orderId}. Total: ₹" . number_format($total) . "</p>";
    }

    public function orderStatusTemplate($orderId, $status)
    {
        return "<h1>Order Update</h1><p>Your order #{$orderId} status is now: <b>" . strtoupper($status) . "</b></p>";
    }

    public function welcomeTemplate($name)
    {
        return "<h1>Welcome to TopStore, {$name}!</h1><p>Thank you for joining us. Happy shopping!</p>";
    }

    public function otpTemplate($code)
    {
        return "<h1>Verification Code</h1><div style='font-size: 24px; font-weight: bold;'>{$code}</div><p>Code expires in 10 minutes.</p>";
    }
}
