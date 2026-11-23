<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * MERGE NOTE: the admin branch shipped its own `create_users_table` migration and the
 * security/store branches ship Laravel's default one. Both cannot create `users`, so the
 * default migration is kept and the admin columns (unchanged) are added here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('role')->default('resident')->after('phone'); // super_admin, admin, manager, security, resident, staff, agent, maintenance, store_owner
            $table->string('status')->default('active')->after('role'); // active, inactive, suspended, pending
            $table->string('staff_id')->nullable()->unique()->after('status');
            $table->string('job_title')->nullable()->after('staff_id');
            $table->string('department')->nullable()->after('job_title');
            $table->string('unit_number')->nullable()->after('department');
            $table->string('avatar_url')->nullable()->after('unit_number');
            $table->timestamp('requested_at')->nullable()->after('avatar_url');
            $table->timestamp('last_active_at')->nullable()->after('requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['staff_id']);
            $table->dropColumn(['phone','role','status','staff_id','job_title','department','unit_number','avatar_url','requested_at','last_active_at']);
        });
    }
};
