<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $email = $request->query('email');
        $phone = $request->query('phone');
        $isCheckout = $request->query('checkout') === 'true';

        if ($isCheckout) {
            if (!$email && !$phone) {
                return response()->json(['error' => 'Email or Phone required'], 400);
            }

            $customer = Order::select(
                'customer_name as fullName',
                'customer_email as email',
                'customer_phone as phone',
                'address',
                'city',
                'pincode'
            )
            ->where(function($query) use ($email, $phone) {
                if ($email) $query->where('customer_email', $email);
                if ($phone) {
                    $cleanPhone = preg_replace('/[^0-9]/', '', str_replace('+91', '', $phone));
                    $query->orWhere('customer_phone', 'like', "%$cleanPhone%");
                }
            })
            ->orderBy('created_at', 'desc')
            ->first();

            return response()->json($customer ? ['found' => true, 'data' => $customer] : ['found' => false]);
        }

        // Admin Mode: List All
        $customers = Order::select(
            'customer_email as email',
            DB::raw('MAX(customer_name) as name'),
            DB::raw('MAX(customer_phone) as phone'),
            DB::raw('COUNT(id) as total_orders'),
            DB::raw('SUM(total_amount) as total_spent'),
            DB::raw('MAX(created_at) as last_order_date')
        )
        ->groupBy('customer_email')
        ->orderBy('last_order_date', 'desc')
        ->get();

        return response()->json($customers);
    }

    public function show(Request $request, $id)
    {
        // For simplicity, we assume ID is either email or UUID
        $email = $request->query('email') ?: $id;

        $stats = Order::select(
            'customer_email as email',
            DB::raw('MAX(customer_name) as name'),
            DB::raw('MAX(customer_phone) as phone'),
            DB::raw('MAX(address) as address'),
            DB::raw('MAX(city) as city'),
            DB::raw('MAX(pincode) as pincode'),
            DB::raw('COUNT(id) as total_orders'),
            DB::raw('SUM(total_amount) as total_spent'),
            DB::raw('MAX(created_at) as last_order_date')
        )
        ->where('customer_email', $email)
        ->first();

        if (!$stats || !$stats->email) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $orders = Order::where('customer_email', $email)->orderBy('created_at', 'desc')->get();
        
        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select('order_items.product_name', DB::raw('COUNT(*) as count'), DB::raw('SUM(order_items.quantity) as total_quantity'))
            ->where('orders.customer_email', $email)
            ->groupBy('order_items.product_name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $activities = ActivityLog::where('customer_id', $email)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'stats' => $stats,
            'orders' => $orders,
            'top_products' => $topProducts,
            'activities' => $activities
        ]);
    }
}
