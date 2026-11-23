<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $t) {
            $t->id();
            $t->foreignId('owner_id')->unique()->constrained('users')->cascadeOnDelete();
            $t->string('name');
            $t->string('category', 100)->nullable();
            $t->string('phone', 30)->nullable();
            $t->string('address')->nullable();
            $t->text('description')->nullable();
            $t->longText('logo')->nullable();                       // data URL, capped by validation
            $t->string('plan', 20)->default('Basic');               // Basic | Pro | Enterprise
            $t->boolean('is_open')->default(true);
            $t->boolean('open_weekends')->default(true);
            $t->string('settlement_method', 40)->default('Bank Transfer');
            $t->string('settlement_frequency', 20)->default('Monthly');
            $t->timestamps();
        });

        Schema::create('store_products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('store_id')->constrained()->cascadeOnDelete();
            $t->string('sku', 40)->unique();
            $t->string('name');
            $t->string('category', 100);
            $t->unsignedBigInteger('price_kobo');
            $t->unsignedInteger('stock')->default(0);
            $t->text('description')->nullable();
            $t->longText('image')->nullable();                      // URL or data URL
            $t->boolean('featured')->default(false);
            $t->timestamps();
            $t->index(['store_id', 'category']);
        });

        Schema::create('store_invoices', function (Blueprint $t) {
            $t->id();
            $t->foreignId('store_id')->constrained()->cascadeOnDelete();
            $t->string('reference', 30)->unique();
            $t->string('description');
            $t->unsignedBigInteger('amount_kobo');
            $t->string('status', 12)->default('pending');           // pending | paid
            $t->date('issued_on');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['store_invoices', 'store_products', 'stores'] as $x) Schema::dropIfExists($x);
    }
};
