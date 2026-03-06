<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Services\NotificationService;
use App\Services\ShiprocketService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Razorpay\Api\Api;

class OrderController extends Controller
{
    protected $notification;
    protected $shiprocket;
    protected $pixel;

    public function __construct(NotificationService $notification, ShiprocketService $shiprocket, \App\Services\PixelService $pixel)
    {
        $this->notification = $notification;
        $this->shiprocket = $shiprocket;
        $this->pixel = $pixel;
    }

    public function index(Request $request)
    {
        $phone = $request->query('phone');
        $adminMode = $request->query('admin') === 'true';

        if ($adminMode) {
            return response()->json(Order::orderBy('created_at', 'desc')->get());
        }

        if ($phone) {
            return response()->json(Order::where('customer_phone', $phone)->orderBy('created_at', 'desc')->get());
        }

        return response()->json(['error' => 'Phone or Admin mode required'], 400);
    }

    public function createRazorpayOrder(Request $request)
    {
        $data = $request->all();
        $amount = (int)($data['amount'] * 100); // Convert to paise
        
        // This would typically involve using the Razorpay PHP SDK
        // For now, we return a mock success
        return response()->json([
            'id' => 'order_' . Str::random(14),
            'amount' => $amount,
            'currency' => 'INR'
        ]);
    }

    public function shiprocketWebhook(Request $request)
    {
        try {
            $payload = $request->all();
            
            if (!isset($payload['order_id']) || !isset($payload['current_status'])) {
                return response()->json(['error' => 'Invalid Payload'], 400);
            }

            $orderId = $payload['order_id'];
            $newStatus = strtolower($payload['current_status']);

            // Status Mapping
            if ($newStatus === 'in transit' || $newStatus === 'shipped') {
                $newStatus = 'shipped';
            } elseif (str_contains($newStatus, 'delivered')) {
                $newStatus = 'delivered';
            } elseif (str_contains($newStatus, 'cancel')) {
                $newStatus = 'cancelled';
            } elseif ($newStatus === 'rto initiated' || $newStatus === 'rto delivered') {
                $newStatus = 'returned';
            }

            $order = Order::find($orderId);
            if (!$order) {
                return response()->json(['success' => true, 'message' => 'Order not found']);
            }

            if ($order->status === $newStatus) {
                return response()->json(['success' => true, 'message' => 'Status unchanged']);
            }

            $order->status = $newStatus;
            
            // If delivered COD, auto-mark paid
            if ($newStatus === 'delivered' && $order->payment_method === 'cod' && $order->payment_status !== 'paid') {
                $order->payment_status = 'paid';
            }

            $order->save();

            // Send WhatsApp Notification
            $trackingLink = "https://moorvikajewels.com/track-order?id={$orderId}";
            if ($order->customer_phone) {
                $this->notification->sendWhatsAppMessage([
                    'to' => $order->customer_phone,
                    'type' => 'order_update',
                    'templateName' => 'order_status_update',
                    'parameters' => [
                        ['type' => 'text', 'text' => $orderId],
                        ['type' => 'text', 'text' => strtoupper($newStatus)],
                        ['type' => 'text', 'text' => $trackingLink]
                    ]
                ]);
            }

            return response()->json(['success' => true, 'newStatus' => $newStatus]);

        } catch (\Exception $e) {
            \Log::error("Shiprocket Webhook Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $customerData = $data['customer'];
        $items = $data['items'];
        $paymentMethod = $data['paymentMethod'];
        $totalAmount = $data['totalAmount'];

        // 1. Verify Razorpay Payment if Online
        if ($paymentMethod === 'online') {
            $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
            try {
                $api->utility->verifyPaymentSignature([
                    'razorpay_order_id' => $data['razorpayOrderId'],
                    'razorpay_payment_id' => $data['paymentId'],
                    'razorpay_signature' => $data['razorpaySignature']
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Payment verification failed'], 400);
            }
        }

        $orderId = (string) Str::uuid();

        // 2. Create Order
        $order = Order::create([
            'id' => $orderId,
            'customer_name' => $customerData['fullName'] ?? $customerData['name'],
            'customer_email' => $customerData['email'],
            'customer_phone' => $customerData['phone'],
            'address' => $customerData['address'],
            'city' => $customerData['city'],
            'pincode' => $customerData['pincode'],
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'payment_status' => $paymentMethod === 'online' ? 'paid' : 'pending',
            'status' => 'pending',
            'razorpay_order_id' => $data['razorpayOrderId'] ?? null,
            'razorpay_payment_id' => $data['paymentId'] ?? null,
            'company_name' => $customerData['companyName'] ?? null,
            'gst_number' => $customerData['gstNumber'] ?? null,
            'pickup_location' => $data['pickup_location'] ?? 'Primary'
        ]);

        // 3. Create Items
        foreach ($items as $item) {
            $orderItemData = [
                'id' => (string) Str::uuid(),
                'order_id' => $orderId,
                'product_id' => $item['product']['id'] ?? 'unknown',
                'product_name' => $item['product']['name'] ?? 'Unknown Item',
                'quantity' => $item['quantity'] ?? 1,
                'price' => $item['variant']['price'] ?? 0,
                'image' => $item['product']['images'][0] ?? null,
                'variant_id' => $item['variant']['id'] ?? null
            ];
            
            if (isset($item['bundle'])) {
                $orderItemData['product_id'] = $item['bundle']['id'];
                $orderItemData['product_name'] = $item['bundle']['name'];
                $orderItemData['price'] = $item['bundle']['price'];
                $orderItemData['image'] = $item['bundle']['image'];
            }

            OrderItem::create($orderItemData);
        }

        // 4. Upsert Customer
        $customer = Customer::where('phone', $customerData['phone'])->first();
        if (!$customer) {
            $customer = Customer::create([
                'id' => (string) Str::uuid(),
                'phone' => $customerData['phone'],
                'name' => $customerData['fullName'],
                'email' => $customerData['email'],
                'status' => 'approved',
                'is_verified' => 0
            ]);
        } else {
            $customer->update([
                'name' => $customerData['fullName'],
                'email' => $customerData['email']
            ]);
        }

        // 5. Notifications
        $this->notification->sendEmail(
            $customerData['email'],
            "Order Confirmation - #{$orderId}",
            $this->notification->orderConfirmationTemplate($orderId, $totalAmount)
        );

        $this->notification->sendWhatsAppMessage(
            $customerData['phone'],
            'order_confirmation',
            'order_confirmation',
            [
                ['type' => 'text', 'text' => $orderId],
                ['type' => 'text', 'text' => number_format($totalAmount)]
            ]
        );

        // 6. Shiprocket Sync
        $token = $this->shiprocket->authenticate();
        if ($token) {
            $this->shiprocket->createOrder($token, [
                'order_id' => $orderId,
                'order_date' => date('Y-m-d H:i'),
                'pickup_location' => "Primary",
                'billing_customer_name' => $customerData['fullName'],
                'billing_last_name' => '',
                'billing_address' => $customerData['address'],
                'billing_city' => $customerData['city'],
                'billing_pincode' => $customerData['pincode'],
                'billing_state' => 'Maharashtra',
                'billing_country' => 'India',
                'billing_email' => $customerData['email'],
                'billing_phone' => $customerData['phone'],
                'shipping_is_billing' => true,
                'order_items' => array_map(function($item) {
                     return [
                         'name' => $item['product']['name'] ?? 'Item',
                         'sku' => $item['variant']['sku'] ?? 'SKU-001',
                         'units' => $item['quantity'] ?? 1,
                         'selling_price' => $item['variant']['price'] ?? 0,
                         'discount' => 0
                     ];
                }, $items),
                'payment_method' => $paymentMethod === 'online' ? 'Prepaid' : 'COD',
                'sub_total' => $totalAmount,
                'length' => 10, 'breadth' => 10, 'height' => 5, 'weight' => 0.2
            ]);
        }

        // 7. Analytics
        $this->pixel->trackPurchase($order);

        return response()->json(['success' => true, 'orderId' => $orderId]);
    }

    public function show($id, Request $request)
    {
        $phone = $request->query('phone');
        $order = Order::with('items')->where('id', $id);
        
        if ($phone) {
            $order->where('customer_phone', $phone);
        }

        $res = $order->first();
        return $res ? response()->json($res) : response()->json(['error' => 'Order not found'], 404);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->only(['status', 'payment_status']));

        if ($request->status) {
             $this->notification->sendWhatsAppMessage(
                $order->customer_phone,
                'order_update',
                'order_status_update',
                [
                    ['type' => 'text', 'text' => $id],
                    ['type' => 'text', 'text' => strtoupper($request->status)],
                    ['type' => 'text', 'text' => 'https://moorvikajewels.com/track-order?id=' . $id]
                ]
            );
        }

        return response()->json(['success' => true]);
    }
}

