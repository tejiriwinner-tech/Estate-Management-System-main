<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $table = 'fin_invoices';

    protected $fillable = [
        'user_id', 'service_charge_id', 'service_name', 'reference', 'amount_kobo', 'paid_kobo',
        'issued_on', 'due_date', 'period_start', 'period_end', 'last_reminded_at',
    ];
    protected $casts = [
        'issued_on' => 'date', 'due_date' => 'date', 'period_start' => 'date', 'period_end' => 'date',
        'last_reminded_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function payments() { return $this->hasMany(Payment::class); }

    public function balanceKobo(): int { return max(0, $this->amount_kobo - $this->paid_kobo); }

    /** paid | partial | overdue | pending, derived from amounts and due date. */
    public function state(): string
    {
        if ($this->paid_kobo >= $this->amount_kobo) return 'paid';
        if ($this->due_date->lt(now()->startOfDay())) return 'overdue';
        return $this->paid_kobo > 0 ? 'partial' : 'pending';
    }

    public static function nextReference(): string
    {
        return 'INV-'.str_pad((string) ((static::max('id') ?? 0) + 1), 6, '0', STR_PAD_LEFT);
    }
}
