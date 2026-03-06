<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview()
    {
        return response()->json([
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
            'total_customers' => Customer::count(),
            'total_products' => Product::count(),
            'pending_orders' => Order::where('status', 'pending')->count()
        ]);
    }

    public function sales()
    {
        $sales = Order::select(
            DB::raw('date(created_at) as date'),
            DB::raw('SUM(total_amount) as total')
        )
        ->where('payment_status', 'paid')
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

        return response()->json($sales);
    }
}

