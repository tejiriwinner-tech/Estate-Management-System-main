<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    public const TYPES = ['rent', 'sale', 'other'];
    public const AVAILABILITY = ['available', 'under_offer', 'rented', 'sold'];

    protected $fillable = [
        'agent_id', 'title', 'description', 'listing_type', 'property_type', 'zone', 'address',
        'beds', 'baths', 'price_kobo', 'price_period', 'photos', 'availability',
    ];

    protected $casts = [
        'photos' => 'array',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /** Visible on the public landing page. */
    public function scopePublic($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function toArray(): array
    {
        $a = parent::toArray();
        $a['price'] = $this->price_kobo / 100;
        unset($a['reviewed_by']);

        return $a;
    }
}
