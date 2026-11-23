<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estate_updates', function (Blueprint $table) {
            $table->id();
            $table->string('headline_prefix')->default('Update From ');
            $table->string('headline_highlight')->default('Estate Admin');
            $table->string('image_url');
            $table->string('image_alt')->nullable();
            $table->text('lead_paragraph');
            $table->text('body_paragraph');
            $table->string('category')->default('Security & Operations');
            $table->string('author_name')->default('Chief Security Officer');
            $table->string('author_role')->default('Security Operations');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estate_updates');
    }
};

