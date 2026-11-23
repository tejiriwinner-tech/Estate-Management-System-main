<?php

namespace App\Models;

use Database\Factories\MerchantFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Merchant extends Model
{
    /** @use HasFactory<MerchantFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'merchant_id',
        'joined_at',
        'tier',
        'total_revenue',
        'pending_settlements',
        'active_products',
        'order_volume',
        'settlement_mode',
        'settlement_frequency',
        'auto_pay_enabled',
        'document_name',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'total_revenue' => 'decimal:2',
            'pending_settlements' => 'decimal:2',
            'active_products' => 'integer',
            'order_volume' => 'integer',
            'auto_pay_enabled' => 'boolean',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
