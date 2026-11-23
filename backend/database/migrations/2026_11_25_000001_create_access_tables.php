<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('access_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // set when the person is a resident/staff
            $t->string('name');
            $t->string('role_label')->nullable();            // e.g. "Resident · Block B", "Guest · Visitor Pass"
            $t->string('gate');
            $t->string('verification_type', 16);             // Face ID | QR Code | Manual | Biometric
            $t->string('status', 16);                        // Authorised | Success | Denied | Flagged
            $t->string('failure_reason')->nullable();
            $t->foreignId('logged_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('occurred_at')->useCurrent()->index();
            $t->timestamps();
        });

        Schema::create('guest_passes', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('invited_by')->nullable();            // unit or resident name
            $t->string('kind', 12)->default('one_time');     // one_time | timed
            $t->timestamp('expires_at')->nullable();
            $t->string('status', 12)->default('active');     // active | used | revoked
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_passes');
        Schema::dropIfExists('access_logs');
    }
};
