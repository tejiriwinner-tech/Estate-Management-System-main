<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    protected $fillable = ['type', 'name', 'direct_key'];

    public function members() { return $this->belongsToMany(User::class, 'chat_room_members')->withPivot('last_read_at')->withTimestamps(); }
    public function messages() { return $this->hasMany(ChatMessage::class); }
}
