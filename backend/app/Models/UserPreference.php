<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    protected $fillable = ['user_id', 'sms_notifications', 'email_notifications', 'members_can_chat', 'about'];

    protected $casts = [
        'sms_notifications' => 'boolean',
        'email_notifications' => 'boolean',
        'members_can_chat' => 'boolean',
    ];
}
