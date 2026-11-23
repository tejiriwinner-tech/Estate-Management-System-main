<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// KAN-64/65/66: agent listings. A listing is only public once approval_status = approved.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('listing_type');                    // rent, sale, other
            $table->string('property_type');                   // Apartment, Terrace, Duplex, Detached, Self-contain, Land, Shop, Other
            $table->string('zone');
            $table->string('address');
            $table->unsignedTinyInteger('beds')->nullable();
            $table->unsignedTinyInteger('baths')->nullable();
            $table->unsignedBigInteger('price_kobo');          // money in kobo, never floats
            $table->string('price_period')->nullable();        // per_year for rent, null for sale
            $table->json('photos')->nullable();
            $table->string('availability')->default('available'); // available, under_offer, rented, sold
            $table->string('approval_status')->default('pending'); // pending, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('inquiries')->default(0);
            $table->timestamps();

            $table->index(['approval_status', 'availability']);
            $table->index(['listing_type', 'property_type', 'zone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
