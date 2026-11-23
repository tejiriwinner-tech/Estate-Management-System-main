<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Viewing extends Model
{
    protected $fillable = ['listing_id', 'client_request_id', 'agent_id', 'client_name', 'scheduled_at', 'status'];
    protected $casts = ['scheduled_at' => 'datetime'];

    public function listing() { return $this->belongsTo(Listing::class); }
}
