<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AwayNotice extends Model
{
    protected $fillable = [
        'user_id', 'resident_name', 'unit', 'departure_date', 'expected_return_date', 'emergency_contact_name',
        'emergency_contact_phone', 'notes', 'notify_security', 'suspend_packages', 'status', 'created_by',
    ];
    protected $casts = [
        'departure_date' => 'date', 'expected_return_date' => 'date',
        'notify_security' => 'boolean', 'suspend_packages' => 'boolean',
    ];
}
