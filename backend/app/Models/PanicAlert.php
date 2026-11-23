<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PanicAlert extends Model
{
    
    protected $fillable = ['user_id', 'location', 'note'];
}
