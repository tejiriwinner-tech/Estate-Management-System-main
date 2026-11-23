<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlacklistEntry extends Model
{
    protected $fillable = [
        'list_type', 'entity_type', 'name', 'entity_ref', 'reason', 'details', 'risk_level',
        'status', 'last_attempt_at', 'last_attempt_location', 'added_by',
    ];
    protected $casts = ['last_attempt_at' => 'datetime'];
}
