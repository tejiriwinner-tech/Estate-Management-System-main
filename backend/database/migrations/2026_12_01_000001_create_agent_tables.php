<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('zone')->nullable();
            $t->unsignedBigInteger('quarterly_target_kobo')->default(0); // commission target; 0 = not set
            $t->timestamps();
        });

        Schema::create('client_requests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('listing_id')->nullable()->constrained('listings')->nullOnDelete();
            $t->string('client_name');
            $t->string('phone', 30);
            $t->string('email')->nullable();
            $t->string('property_type', 50)->default('Any');
            $t->unsignedTinyInteger('min_beds')->default(0);
            $t->string('zone', 100)->default('Any');
            $t->unsignedBigInteger('max_budget_kobo')->default(0);
            $t->date('move_in_by')->nullable();
            $t->text('note')->nullable();
            $t->string('status', 20)->default('New'); // New | Contacted | Viewing Booked | Negotiation | Closed
            $t->timestamps();
            $t->index(['agent_id', 'status']);
        });

        Schema::create('viewings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $t->foreignId('client_request_id')->nullable()->constrained('client_requests')->nullOnDelete();
            $t->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $t->string('client_name');
            $t->dateTime('scheduled_at');
            $t->string('status', 12)->default('Scheduled'); // Scheduled | Completed | Cancelled
            $t->timestamps();
            $t->index(['agent_id', 'scheduled_at']);
        });

        Schema::create('commission_payouts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('listing_id')->unique()->constrained()->cascadeOnDelete(); // paid once per property
            $t->unsignedBigInteger('amount_kobo');
            $t->timestamp('paid_at');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['commission_payouts', 'viewings', 'client_requests', 'agent_profiles'] as $x) Schema::dropIfExists($x);
    }
};
