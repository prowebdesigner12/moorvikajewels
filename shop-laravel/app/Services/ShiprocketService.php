<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ShiprocketService
{
    protected $email;
    protected $password;
    protected $baseUrl = 'https://apiv2.shiprocket.in/v1/external';

    public function __construct()
    {
        $this->email = config('services.shiprocket.email');
        $this->password = config('services.shiprocket.password');
    }

    public function authenticate()
    {
        try {
            if (!$this->email || !$this->password) return null;

            $response = Http::post($this->baseUrl . '/auth/login', [
                'email' => $this->email,
                'password' => $this->password,
            ]);

            return $response->json()['token'] ?? null;
        } catch (\Exception $e) {
            \Log::error("Shiprocket Auth Error: " . $e->getMessage());
            return null;
        }
    }

    public function createOrder($token, $orderData)
    {
        try {
            $response = Http::withToken($token)
                ->post($this->baseUrl . '/orders/create/adhoc', $orderData);

            return $response->json();
        } catch (\Exception $e) {
            \Log::error("Shiprocket Order Error: " . $e->getMessage());
            return null;
        }
    }
}
