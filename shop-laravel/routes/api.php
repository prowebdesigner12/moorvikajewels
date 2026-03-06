<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\LoyaltyPointController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AbandonedCheckoutController;
use App\Http\Controllers\WhatsAppLogController;
use App\Http\Controllers\BundleController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\SitemapController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public & Admin Products
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products', [ProductController::class, 'update']);
Route::delete('/products', [ProductController::class, 'destroy']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Collections
Route::apiResource('collections', CollectionController::class);

// Orders
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::patch('/orders/{id}', [OrderController::class, 'update']);
Route::post('/razorpay', [OrderController::class, 'createRazorpayOrder']);
Route::post('/abandoned', [AbandonedCheckoutController::class, 'store']);

// Inquiries
Route::get('/inquiries', [InquiryController::class, 'index']);
Route::post('/inquiries', [InquiryController::class, 'store']);
Route::put('/inquiries', [InquiryController::class, 'update']);

// Discounts
Route::apiResource('discounts', DiscountController::class);

// Reviews
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::patch('/reviews/{id}', [ReviewController::class, 'update']);
Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

// Auth
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/verify-phone', [AuthController::class, 'verifyPhone']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp']);

// User Management (Admin)
Route::get('/users', [AuthController::class, 'usersIndex']);
Route::patch('/users', [AuthController::class, 'userUpdate']);

// Admin Routes Group
Route::prefix('admin')->group(function () {
    // Abandoned Checkouts
    Route::get('/abandoned', [AbandonedCheckoutController::class, 'index']);
    Route::post('/recover_abandoned', [AbandonedCheckoutController::class, 'recover']);
    Route::apiResource('abandoned-checkouts', AbandonedCheckoutController::class);

    // Analytics
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/sales', [AnalyticsController::class, 'sales']);

    // WhatsApp Logs
    Route::get('/whatsapp-logs', [WhatsAppLogController::class, 'index']);
    Route::get('/whatsapp/webhook', [WhatsAppLogController::class, 'webhook']); // GET for Verification
    Route::post('/whatsapp/webhook', [WhatsAppLogController::class, 'webhook']); // POST for Messages
});

// Loyalty Points
Route::get('/loyalty', [LoyaltyPointController::class, 'index']);

// WhatsApp Logs
Route::get('/whatsapp-logs', [WhatsAppLogController::class, 'index']);
Route::get('/whatsapp/webhook', [WhatsAppLogController::class, 'webhook']); // GET for Verification
Route::post('/whatsapp/webhook', [WhatsAppLogController::class, 'webhook']); // POST for Messages

// Bundles
Route::apiResource('bundles', BundleController::class);

// Subscriptions
Route::get('/subscriptions', [SubscriptionController::class, 'index']);
Route::post('/subscriptions', [SubscriptionController::class, 'store']);
Route::patch('/subscriptions/{id}', [SubscriptionController::class, 'update']);

// Newsletter
Route::post('/newsletter', [NewsletterController::class, 'store']);

// AI Chat
Route::post('/chat', [ChatController::class, 'chat']);

// Customers
Route::get('/customers', [CustomerController::class, 'index']);
Route::get('/customers/{id}', [CustomerController::class, 'show']);

// Webhooks
Route::post('/webhooks/shiprocket', [OrderController::class, 'shiprocketWebhook']);

// Sitemap
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// Upload
Route::post('/upload', [UploadController::class, 'upload']);
Route::get('/upload', [UploadController::class, 'show']);
