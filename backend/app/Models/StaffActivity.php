<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_name',
        'action_text',
        'target_entity',
        'timestamp_display',
        'dot_color',
    ];
}
