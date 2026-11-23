<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentProfile extends Model
{
    protected $fillable = ['user_id', 'zone', 'quarterly_target_kobo'];
}
