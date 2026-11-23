<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstateAlert extends Model
{
    protected $fillable = ['sender_id', 'category', 'message', 'location', 'status'];

    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}
