<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // What the estate charges for (security levy, waste, water ...). Money is stored in kobo.
        Schema::create('fin_service_charges', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('category')->default('General');
            $t->unsignedBigInteger('fee_kobo');
            $t->string('frequency', 12)->default('Monthly');   // Monthly | Quarterly | Yearly | One-Time
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        // A bill raised against a resident.
        Schema::create('fin_invoices', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('service_charge_id')->nullable()->constrained('fin_service_charges')->nullOnDelete();
            $t->string('service_name');
            $t->string('reference')->unique();                 // INV-000123
            $t->unsignedBigInteger('amount_kobo');
            $t->unsignedBigInteger('paid_kobo')->default(0);
            $t->date('issued_on');
            $t->date('due_date')->index();
            $t->date('period_start')->nullable();
            $t->date('period_end')->nullable();
            $t->timestamp('last_reminded_at')->nullable();
            $t->timestamps();
        });

        // Money received against an invoice (cash, transfer, Paystack ...).
        Schema::create('fin_payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('invoice_id')->constrained('fin_invoices')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->unsignedBigInteger('amount_kobo');
            $t->string('method', 20);                          // Cash | Bank Transfer | Card | Paystack
            $t->string('reference')->unique();                 // REC-000123 (the receipt number)
            $t->string('gateway_reference')->nullable()->index();
            $t->string('status', 12)->default('success');      // success | pending | failed
            $t->timestamp('paid_at')->nullable()->index();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fin_payments');
        Schema::dropIfExists('fin_invoices');
        Schema::dropIfExists('fin_service_charges');
    }
};
