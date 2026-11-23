<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientRequest extends Model
{
    public const STATUSES = ['New', 'Contacted', 'Viewing Booked', 'Negotiation', 'Closed'];

    protected $fillable = ['agent_id', 'listing_id', 'client_name', 'phone', 'email', 'property_type', 'min_beds', 'zone', 'max_budget_kobo', 'move_in_by', 'note', 'status'];
    protected $casts = ['move_in_by' => 'date'];

    public function viewings() { return $this->hasMany(Viewing::class); }
}
