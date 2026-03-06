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
        Schema::create('bundles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->float('price');
            $table->float('original_price')->nullable();
            $table->string('discount_label')->nullable();
            $table->string('image')->nullable();
            $table->string('type')->default('fixed_combo');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('bundle_items', function (Blueprint $table) {
            $table->id();
            $table->string('bundle_id');
            $table->string('product_id');
            $table->string('variant_id')->nullable();
            $table->integer('quantity')->default(1);
            $table->foreign('bundle_id')->references('id')->on('bundles')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_phone');
            $table->string('product_id');
            $table->string('variant_id')->nullable();
            $table->string('frequency');
            $table->timestamp('next_billing_date');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('bundle_items');
        Schema::dropIfExists('bundles');
    }
};
