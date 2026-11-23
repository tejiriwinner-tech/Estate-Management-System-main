<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('blacklist_entries', function (Blueprint $t) {
            $t->id();
            $t->string('list_type', 12)->default('blacklist')->index();   // blacklist | watchlist
            $t->string('entity_type', 16)->default('person');             // person | organisation | network | vehicle
            $t->string('name');
            $t->string('entity_ref')->nullable();
            $t->string('reason');
            $t->text('details')->nullable();
            $t->string('risk_level', 12)->default('ELEVATED');            // LOW | MEDIUM | ELEVATED | HIGH | EXTREME
            $t->string('status', 20)->default('RESTRICTED');              // RESTRICTED | UNDER_OBSERVATION | UNDER_REVIEW | CLEARED
            $t->timestamp('last_attempt_at')->nullable();
            $t->string('last_attempt_location')->nullable();
            $t->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blacklist_entries');
    }
};
