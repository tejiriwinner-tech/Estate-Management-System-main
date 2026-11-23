<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstateUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'headline_prefix',
        'headline_highlight',
        'image_url',
        'image_alt',
        'lead_paragraph',
        'body_paragraph',
        'category',
        'author_name',
        'author_role',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}

