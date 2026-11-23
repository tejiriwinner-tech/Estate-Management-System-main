<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionPayout extends Model
{
    protected $fillable = ['agent_id', 'listing_id', 'amount_kobo', 'paid_at'];
    protected $casts = ['paid_at' => 'datetime'];
}
