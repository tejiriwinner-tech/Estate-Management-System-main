<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('away_notices', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('resident_name');
            $t->string('unit');
            $t->date('departure_date');
            $t->date('expected_return_date');
            $t->string('emergency_contact_name')->nullable();
            $t->string('emergency_contact_phone')->nullable();
            $t->string('notes')->nullable();
            $t->boolean('notify_security')->default(true);
            $t->boolean('suspend_packages')->default(false);
            $t->string('status', 12)->default('away')->index();   // away | returned
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('away_notices');
    }
};
