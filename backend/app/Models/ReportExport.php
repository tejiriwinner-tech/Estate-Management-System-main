<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportExport extends Model
{
    protected $fillable = ['template_id', 'file_name', 'format', 'path', 'generated_by'];
}
