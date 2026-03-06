<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PixelService
{
    protected $pixelId;
    protected $accessToken;

    public function __construct()
    {
        $this->pixelId = config('services.meta.pixel_id');
        $this->accessToken = config('services.meta.access_token');
    }

    public function trackEvent($eventName, $userData = [], $customData = [])
    {
        if (!$this->pixelId || !$this->accessToken) {
            Log::warning("Meta Pixel credentials not set. Event $eventName not tracked.");
            return false;
        }

        try {
            $response = Http::post("https://graph.facebook.com/v17.0/{$this->pixelId}/events", [
                'data' => [
                    [
                        'event_name' => $eventName,
                        'event_time' => time(),
                        'action_source' => 'website',
                        'user_data' => array_merge([
                            'client_ip_address' => request()->ip(),
                            'client_user_agent' => request()->userAgent(),
                        ], $userData),
                        'custom_data' => $customData,
                    ],
                ],
                'access_token' => $this->accessToken,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Meta Pixel CAPI Error: " . $e->getMessage());
            return false;
        }
    }

    public function trackPurchase($order)
    {
        return $this->trackEvent('Purchase', [
            'em' => [hash('sha256', strtolower($order->customer_email))],
            'ph' => [hash('sha256', $order->customer_phone)],
        ], [
            'value' => $order->total_amount,
            'currency' => 'INR',
            'order_id' => $order->id,
        ]);
    }
}
