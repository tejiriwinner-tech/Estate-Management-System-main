<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreProduct extends Model
{
    protected $fillable = ['store_id', 'sku', 'name', 'category', 'price_kobo', 'stock', 'description', 'image', 'featured'];
    protected $casts = ['featured' => 'boolean'];

    public function store() { return $this->belongsTo(Store::class); }
}
