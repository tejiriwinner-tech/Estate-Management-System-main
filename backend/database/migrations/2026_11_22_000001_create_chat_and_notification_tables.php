<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chat_rooms', function (Blueprint $t) {
            $t->id();
            $t->string('type', 16)->index();            // estate | security | direct
            $t->string('name')->nullable();
            $t->string('direct_key')->nullable()->unique(); // "minId:maxId" for 1:1 rooms
            $t->timestamps();
        });

        Schema::create('chat_room_members', function (Blueprint $t) {
            $t->id();
            $t->foreignId('chat_room_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->timestamp('last_read_at')->nullable();
            $t->timestamps();
            $t->unique(['chat_room_id', 'user_id']);
        });

        Schema::create('chat_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('chat_room_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->text('body');
            $t->timestamps();
            $t->index(['chat_room_id', 'id']);
        });

        Schema::create('app_notifications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('type', 32)->index();            // alert | message | meeting | system
            $t->string('title');
            $t->text('body')->nullable();
            $t->json('data')->nullable();
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'read_at']);
        });

        Schema::create('estate_alerts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $t->string('category', 24)->index();        // life_threat | intelligence
            $t->string('message');
            $t->string('location')->nullable();
            $t->string('status', 16)->default('open');  // open | resolved
            $t->timestamps();
        });

        Schema::create('meeting_reports', function (Blueprint $t) {
            $t->id();
            $t->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $t->string('title');
            $t->text('body');
            $t->timestamp('held_at')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['meeting_reports', 'estate_alerts', 'app_notifications', 'chat_messages', 'chat_room_members', 'chat_rooms'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
