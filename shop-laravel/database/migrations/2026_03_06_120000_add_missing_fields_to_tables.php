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
        Schema::table('products', function (Blueprint $table) {
            $table->json('wholesale_tiers')->nullable();
        });

        Schema::table('discounts', function (Blueprint $table) {
            $table->boolean('is_referral')->default(false);
            $table->string('referrer_id')->nullable();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('pickup_location')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'gst_number', 'pickup_location']);
        });

        Schema::table('discounts', function (Blueprint $table) {
            $table->dropColumn(['is_referral', 'referrer_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('wholesale_tiers');
        });
    }
};
