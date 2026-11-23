<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    public const PLANS = ['Basic' => 25000, 'Pro' => 65000, 'Enterprise' => 180000]; // naira per month

    protected $fillable = ['owner_id', 'name', 'category', 'phone', 'address', 'description', 'logo', 'plan', 'is_open', 'open_weekends', 'settlement_method', 'settlement_frequency'];
    protected $casts = ['is_open' => 'boolean', 'open_weekends' => 'boolean'];

    public function products() { return $this->hasMany(StoreProduct::class); }
    public function invoices() { return $this->hasMany(StoreInvoice::class); }
}
