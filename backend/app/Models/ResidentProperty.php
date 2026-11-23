<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResidentProperty extends Model
{
    protected $table = 'resident_properties';
    protected $fillable = ['user_id', 'type', 'name', 'property_number', 'sector', 'unit_type', 'ownership_status', 'colour', 'others', 'document_path'];
}
