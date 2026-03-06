<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('mobile');
            $table->string('date');
            $table->text('initial_query')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('status')->default('New');
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price');
            $table->integer('original_price')->nullable();
            $table->string('category');
            $table->float('rating')->default(0);
            $table->integer('reviews')->default(0);
            $table->json('images')->nullable();
            $table->json('variants')->nullable();
            $table->json('tags')->nullable();
            $table->string('slug')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('status')->default('active');
            $table->string('vendor')->nullable();
            $table->string('type')->nullable();
            $table->float('weight')->nullable();
            $table->integer('stock')->default(0);
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->integer('track_quantity')->default(1);
            $table->integer('continue_selling_oos')->default(0);
            $table->timestamps();
        });

        Schema::create('collections', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('slug')->nullable();
            $table->string('type')->default('manual');
            $table->json('products')->nullable();
            $table->timestamps();
        });

        Schema::create('discounts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code')->unique();
            $table->string('type');
            $table->float('value');
            $table->string('status')->default('active');
            $table->integer('usage_limit')->nullable();
            $table->float('min_amount')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->text('address');
            $table->string('city');
            $table->string('pincode');
            $table->float('total_amount');
            $table->string('payment_method');
            $table->string('payment_status')->default('pending');
            $table->string('status')->default('pending');
            $table->string('razorpay_order_id')->nullable();
            $table->string('razorpay_payment_id')->nullable();
            $table->string('shiprocket_order_id')->nullable();
            $table->string('shiprocket_shipment_id')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('order_id');
            $table->string('product_id');
            $table->string('variant_id')->nullable();
            $table->string('product_name');
            $table->integer('quantity');
            $table->float('price');
            $table->string('image')->nullable();
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('product_id');
            $table->string('customer_name');
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->unique();
            $table->string('password')->nullable();
            $table->string('status')->default('approved');
            $table->integer('is_verified')->default(0);
            $table->timestamps();
        });

        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_phone');
            $table->string('message_type');
            $table->string('status');
            $table->text('response_data')->nullable();
            $table->timestamps();
        });

        Schema::create('abandoned_checkouts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->json('cart_data');
            $table->float('total_amount');
            $table->timestamp('notification_sent_at')->nullable();
            $table->integer('reminder_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_tables');
    }
};
