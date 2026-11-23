<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'due_time',
        'is_completed',
        'priority',
        'user_id',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
    ];
}

