<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestPass extends Model
{
    protected $fillable = ['name', 'invited_by', 'kind', 'expires_at', 'status', 'created_by'];
    protected $casts = ['expires_at' => 'datetime'];
}
