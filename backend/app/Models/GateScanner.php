<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GateScanner extends Model
{
    protected $fillable = ['name', 'ip_address', 'enabled', 'last_ping_at'];
    protected $casts = ['enabled' => 'boolean', 'last_ping_at' => 'datetime'];

    /** A scanner counts as online if enabled and it reported in the last 5 minutes. */
    public function isOnline(): bool
    {
        return $this->enabled && $this->last_ping_at && $this->last_ping_at->gt(now()->subMinutes(5));
    }
}
