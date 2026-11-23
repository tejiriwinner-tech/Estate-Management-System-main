<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_activities', function (Blueprint $table) {
            $table->id();
            $table->string('staff_name');
            $table->string('action_text');
            $table->string('target_entity')->nullable();
            $table->string('timestamp_display'); // e.g. "10:45 AM Today", "Yesterday"
            $table->string('dot_color')->default('green'); // green, red, blue
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_activities');
    }
};
