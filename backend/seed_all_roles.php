<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$password = Hash::make('LincolnEstate2024!');

$accounts = [
    [
        'email' => 'admin@lincolnestate.ng',
        'name' => 'Estate Administrator',
        'role' => 'admin',
        'status' => 'active',
        'job_title' => 'Estate Manager',
        'phone' => '+234 802 555 0148',
    ],
    [
        'email' => 'resident@lincolnestate.ng',
        'name' => 'Chinedu Resident',
        'role' => 'resident',
        'status' => 'active',
        'unit_number' => 'Villa A-402',
        'job_title' => 'Homeowner / Resident',
        'phone' => '+234 801 234 5678',
    ],
    [
        'email' => 'security@lincolnestate.ng',
        'name' => 'Mike Security Warden',
        'role' => 'security',
        'status' => 'active',
        'unit_number' => 'Gate 1',
        'job_title' => 'Chief Security Officer',
        'phone' => '+234 803 456 7890',
    ],
    [
        'email' => 'agent@lincolnestate.ng',
        'name' => 'Marcus Real Estate Agent',
        'role' => 'agent',
        'status' => 'active',
        'job_title' => 'Senior Leasing Agent',
        'phone' => '+234 804 567 8901',
    ],
    [
        'email' => 'store@lincolnestate.ng',
        'name' => 'Lincoln Mart Store Manager',
        'role' => 'store_owner',
        'status' => 'active',
        'job_title' => 'Merchant Store Owner',
        'phone' => '+234 805 678 9012',
    ],
];

foreach ($accounts as $acc) {
    $user = User::updateOrCreate(
        ['email' => $acc['email']],
        array_merge($acc, [
            'password' => $password,
            'last_active_at' => now(),
        ])
    );

    // Ensure Spatie role is assigned if exists
    try {
        $spatieRole = Role::where('name', $acc['role'])->first();
        if ($spatieRole && !$user->hasRole($acc['role'])) {
            $user->assignRole($acc['role']);
        }
    } catch (\Throwable $e) {
        // Spatie role assignment fallback
    }

    echo "Provisioned: " . $user->email . " | Role: " . $user->role . "\n";
}

// Also ensure pre-existing users have active status and the uniform password
$others = [
    'john.d@example.com' => 'resident',
    'm.warden@example.com' => 'security',
    'm.reed@lincolnestate.com' => 'agent',
];

foreach ($others as $email => $role) {
    $u = User::where('email', $email)->first();
    if ($u) {
        $u->update([
            'status' => 'active',
            'password' => $password,
        ]);
        echo "Updated existing user: " . $u->email . " to active.\n";
    }
}

echo "All roles successfully provisioned!\n";
