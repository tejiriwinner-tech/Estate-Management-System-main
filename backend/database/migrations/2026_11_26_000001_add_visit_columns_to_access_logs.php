<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('access_logs', function (Blueprint $t) {
            $t->string('direction', 3)->default('in')->after('gate');          // in | out
            $t->string('person_type', 12)->default('Resident')->after('name'); // Resident | Visitor | Service
            $t->string('house_no')->nullable()->after('person_type');
            $t->string('vehicle_plate')->nullable()->after('house_no');
            $t->index(['direction', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::table('access_logs', function (Blueprint $t) {
            $t->dropIndex(['direction', 'occurred_at']);
            $t->dropColumn(['direction', 'person_type', 'house_no', 'vehicle_plate']);
        });
    }
};
