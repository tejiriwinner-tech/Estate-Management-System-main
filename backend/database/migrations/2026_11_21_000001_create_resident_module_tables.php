<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// KAN-31 to KAN-35 (resident app). Field names follow the Figma tables.
return new class extends Migration
{
    public function up(): void
    {
        // Figma "Family Members": Name, Role In Family, Age, Gender
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role_in_family');               // Husband, Wife, Child ...
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('gender', 10)->nullable();       // Male, Female
            $table->timestamps();
        });

        // Figma "Properties": Type, Name, Properties Number, Colour, Others. Also "Register New Property" form.
        Schema::create('resident_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                          // house, car, other
            $table->string('name');                          // LE B001-SECTION, Lexus
            $table->string('property_number');               // LHEB001, fct0023jb
            $table->string('sector')->nullable();            // register form: Sector / Block
            $table->string('unit_type')->nullable();         // register form: Unit Type
            $table->string('ownership_status')->nullable();  // Owner (Resident), Tenant ...
            $table->string('colour')->nullable();
            $table->string('others')->nullable();            // 8 Bed Room, RX350
            $table->string('document_path')->nullable();     // title deed, tenancy agreement, NOC
            $table->string('status')->default('pending');    // draft, pending, verified (admin verifies)
            $table->timestamps();
        });

        // Figma "Family Check in and Out Activity"
        Schema::create('resident_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamp('out_at')->nullable();
            $table->string('out_with')->nullable();          // Family, Alone
            $table->timestamp('in_at')->nullable();
            $table->string('in_with')->nullable();           // Alone, Wife
            $table->timestamps();
        });

        // Figma "Settings": SMS Notification, Email Notification, All Members Can Chat With Me
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->boolean('members_can_chat')->default(true);
            $table->text('about')->nullable();               // Figma "About" tab text
            $table->timestamps();
        });

        // Figma "life under threat" / PANIC. Security app reads this table.
        Schema::create('panic_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('location')->nullable();
            $table->text('note')->nullable();
            $table->string('status')->default('open');       // open, acknowledged, resolved
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        foreach (['panic_alerts', 'user_preferences', 'resident_activities', 'resident_properties', 'family_members'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
