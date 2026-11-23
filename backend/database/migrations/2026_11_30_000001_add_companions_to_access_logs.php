<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('access_logs', function (Blueprint $t) {
            $t->string('companions')->nullable()->after('vehicle_plate'); // "Family", "Wife", ...
        });
    }

    public function down(): void
    {
        Schema::table('access_logs', function (Blueprint $t) {
            $t->dropColumn('companions');
        });
    }
};
