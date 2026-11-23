<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = User::updateOrCreate(
    ['email' => 'admin@lincolnestate.ng'],
    [
        'name' => 'Estate Administrator',
        'role' => 'admin',
        'status' => 'active',
        'password' => Hash::make('LincolnEstate2024!'),
        'last_active_at' => now(),
    ]
);

echo "Admin user ready: " . $user->email . " with role: " . $user->role . "\n";
