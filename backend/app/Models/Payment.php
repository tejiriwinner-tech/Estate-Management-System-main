<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'fin_payments';

    protected $fillable = ['invoice_id', 'user_id', 'amount_kobo', 'method', 'reference', 'gateway_reference', 'status', 'paid_at', 'recorded_by'];
    protected $casts = ['paid_at' => 'datetime'];

    public function invoice() { return $this->belongsTo(Invoice::class); }
    public function user() { return $this->belongsTo(User::class); }

    public static function nextReference(): string
    {
        return 'REC-'.str_pad((string) ((static::max('id') ?? 0) + 1), 6, '0', STR_PAD_LEFT);
    }
}
