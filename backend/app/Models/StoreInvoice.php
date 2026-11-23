<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreInvoice extends Model
{
    protected $fillable = ['store_id', 'reference', 'description', 'amount_kobo', 'status', 'issued_on'];
    protected $casts = ['issued_on' => 'date'];
}
