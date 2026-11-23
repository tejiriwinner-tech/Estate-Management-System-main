<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingReport extends Model
{
    protected $fillable = ['created_by', 'title', 'body', 'held_at'];
    protected $casts = ['held_at' => 'datetime'];
}
