<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['user_id', 'owner_name', 'owner_role', 'house_unit', 'vehicle_type', 'plate_number', 'status', 'valid_until'];
    protected $casts = ['valid_until' => 'date'];
}
