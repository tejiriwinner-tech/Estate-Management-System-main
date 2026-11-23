<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('owner_name');
            $t->string('owner_role', 12)->default('Resident');   // Resident | Vendor | Visitor
            $t->string('house_unit')->nullable();
            $t->string('vehicle_type');                          // e.g. "SUV - Toyota Land Cruiser"
            $t->string('plate_number')->unique();
            $t->string('status', 12)->default('active')->index(); // active | pending | disabled
            $t->date('valid_until')->nullable();                 // visitor passes
            $t->timestamps();
        });

        Schema::create('gate_scanners', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('ip_address')->nullable();
            $t->boolean('enabled')->default(true);
            $t->timestamp('last_ping_at')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_scanners');
        Schema::dropIfExists('vehicles');
    }
};
