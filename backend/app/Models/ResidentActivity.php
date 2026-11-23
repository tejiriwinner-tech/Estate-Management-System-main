<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResidentActivity extends Model
{
    
    protected $fillable = ['user_id', 'name', 'out_at', 'out_with', 'in_at', 'in_with'];

    protected $casts = ['out_at' => 'datetime', 'in_at' => 'datetime'];
}
