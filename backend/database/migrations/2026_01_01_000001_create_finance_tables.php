<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Finance, Service Management & Paystack.
     */
    public function up(): void
    {
        // 1. Estate Billable Services (Task 18)
        Schema::create('service_charges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Security Fee, Waste Management, etc.
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('default_amount', 12, 2)->default(0.00);
            $table->enum('billing_frequency', ['monthly', 'quarterly', 'annually', 'one_time'])->default('monthly');
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Invoices & Outstanding Levies (Tasks 14, 15)
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->string('resident_id');
            $table->string('property_unit')->nullable(); // Flat 4B, Block 2, etc.
            $table->foreignUuid('service_charge_id')->constrained('service_charges')->cascadeOnDelete();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0.00);
            $table->decimal('balance_due', 12, 2);
            $table->date('due_date');
            $table->enum('status', ['paid', 'partial', 'pending', 'overdue'])->default('pending');
            $table->timestamps();
        });

        // 3. Payment Records & Paystack Transactions (Tasks 6-9, 19-22)
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('resident_id');
            $table->string('transaction_reference')->unique(); // Paystack reference
            $table->string('paystack_reference')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('payment_method', ['paystack', 'bank_transfer', 'pos', 'cash'])->default('paystack');
            $table->string('paystack_channel')->nullable(); // card, bank, ussd
            $table->enum('status', ['success', 'pending', 'failed', 'reversed'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // 4. Payment Receipts (Tasks 10-13)
        Schema::create('receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('receipt_number')->unique();
            $table->string('pdf_path')->nullable();
            $table->timestamp('issued_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('service_charges');
    }
};
