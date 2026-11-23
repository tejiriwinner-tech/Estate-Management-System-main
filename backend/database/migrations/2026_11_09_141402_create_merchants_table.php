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
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('merchant_id')->unique();
            $table->date('joined_at');
            $table->string('tier');
            $table->decimal('total_revenue', 14, 2);
            $table->decimal('pending_settlements', 14, 2);
            $table->unsignedInteger('active_products');
            $table->unsignedInteger('order_volume');
            $table->string('settlement_mode');
            $table->string('settlement_frequency');
            $table->boolean('auto_pay_enabled')->default(false);
            $table->string('document_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};
