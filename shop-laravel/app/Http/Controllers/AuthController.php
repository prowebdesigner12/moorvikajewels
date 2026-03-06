<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Models\Otp;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected $notification;

    public function __construct(NotificationService $notification)
    {
        $this->notification = $notification;
    }

    public function signup(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'name' => 'required',
            'email' => 'nullable|email',
            'password' => 'nullable'
        ]);

        $existing = Customer::where('phone', $request->phone)
            ->orWhere('email', $request->email)
            ->first();

        if ($existing) {
            if (!$existing->is_verified) {
                return response()->json([
                    'success' => false,
                    'require_otp' => true,
                    'user_id' => $existing->id,
                    'message' => 'Account exists but is not verified. Please request a new OTP.'
                ], 400);
            }
            return response()->json(['error' => 'Customer already exists'], 400);
        }

        $id = (string) Str::uuid();
        $customer = Customer::create([
            'id' => $id,
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'password' => $request->password, // Note: In production use Hash::make
            'is_verified' => 0
        ]);

        // Generate OTP
        $code = (string) rand(100000, 999999);
        Otp::create([
            'id' => (string) Str::uuid(),
            'customer_id' => $id,
            'code' => $code,
            'type' => 'phone_verification',
            'expires_at' => Carbon::now()->addMinutes(10)
        ]);

        // Send WhatsApp OTP
        $this->notification->sendWhatsAppMessage(
            $request->phone,
            'otp',
            'otp_verify',
            [['type' => 'text', 'text' => $code]]
        );

        return response()->json([
            'success' => true,
            'require_otp' => true,
            'user_id' => $id,
            'message' => 'OTP sent via WhatsApp'
        ]);
    }

    public function verifyPhone(Request $request)
    {
        $request->validate([
            'userId' => 'required',
            'code' => 'required'
        ]);

        $otp = Otp::where('customer_id', $request->userId)
            ->where('code', $request->code)
            ->where('type', 'phone_verification')
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['error' => 'Invalid or expired OTP'], 400);
        }

        $customer = Customer::findOrFail($request->userId);
        $customer->update(['is_verified' => 1]);
        
        // Delete used otp
        Otp::where('customer_id', $request->userId)->where('type', 'phone_verification')->delete();

        return response()->json([
            'success' => true,
            'user' => array_merge($customer->toArray(), ['role' => 'customer'])
        ]);
    }

    public function login(Request $request)
    {
        $request->validate(['phone' => 'required']);

        // 1. Try Customer
        $customer = Customer::where('phone', $request->phone)->first();
        if ($customer) {
            if ($customer->status === 'suspended') {
                return response()->json(['error' => 'Account suspended'], 403);
            }
            if (!$customer->is_verified) {
                return response()->json(['error' => 'Verify phone', 'require_otp' => true, 'user_id' => $customer->id], 403);
            }
            if ($customer->password && $customer->password !== $request->password) {
                return response()->json(['error' => 'Invalid password'], 401);
            }
            return response()->json(['success' => true, 'user' => array_merge($customer->toArray(), ['role' => 'customer'])]);
        }

        // 2. Try Admin
        $admin = User::where('phone', $request->phone)->first();
        if ($admin) {
            if ($admin->password && $admin->password !== $request->password) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
            return response()->json(['success' => true, 'user' => array_merge($admin->toArray(), ['role' => 'admin'])]);
        }

        return response()->json(['error' => 'User not found'], 404);
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['userId' => 'required']);

        $customer = Customer::find($request->userId);
        if (!$customer) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Delete old OTPs
        Otp::where('customer_id', $customer->id)->where('type', 'phone_verification')->delete();

        // Generate New OTP
        $code = (string) rand(100000, 999999);
        Otp::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'customer_id' => $customer->id,
            'code' => $code,
            'type' => 'phone_verification',
            'expires_at' => \Carbon\Carbon::now()->addMinutes(10)
        ]);

        // Send WhatsApp OTP
        $this->notification->sendWhatsAppMessage(
            $customer->phone,
            'otp',
            'otp_verify',
            [['type' => 'text', 'text' => $code]]
        );

        return response()->json([
            'success' => true,
            'message' => 'New OTP sent via WhatsApp'
        ]);
    }

    public function usersIndex()
    {
        // 1. Get Admins
        $admins = User::all()->map(function($user) {
            $user->role = 'admin';
            return $user;
        });

        // 2. Get Customers
        $customers = Customer::all()->map(function($user) {
            $user->role = 'customer';
            return $user;
        });

        return response()->json($admins->concat($customers));
    }

    public function userUpdate(Request $request)
    {
        $id = $request->id;
        $status = $request->status;

        $user = Customer::find($id);
        if ($user) {
            $user->update(['status' => $status]);
            return response()->json(['success' => true]);
        }

        $admin = User::find($id);
        if ($admin) {
            $admin->update(['status' => $status]); // Assuming User table has status or similar
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'User not found'], 404);
    }
}

