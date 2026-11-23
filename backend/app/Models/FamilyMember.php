<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    
    protected $fillable = ['user_id', 'name', 'role_in_family', 'age', 'gender'];
}
