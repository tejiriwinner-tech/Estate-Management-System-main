<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john.d@example.com',
                'phone' => '+234 801 234 5678',
                'role' => 'resident',
                'status' => 'active',
                'unit_number' => 'Villa A-402',
                'staff_id' => null,
                'job_title' => 'Homeowner / Resident',
                'avatar_url' => 'https://ui-avatars.com/api/?name=John+Doe&background=0A5C36&color=fff&bold=true',
                'requested_at' => null,
            ],
            [
                'name' => 'Sarah Jenkins',
                'email' => 's.jenkins@example.com',
                'phone' => '+234 802 345 6789',
                'role' => 'manager',
                'status' => 'active',
                'unit_number' => 'Block B, 204',
                'staff_id' => 'STF-4829',
                'job_title' => 'Senior Property Manager',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                'requested_at' => null,
            ],
            [
                'name' => 'Mike Warden',
                'email' => 'm.warden@example.com',
                'phone' => '+234 803 456 7890',
                'role' => 'security',
                'status' => 'inactive',
                'unit_number' => 'Gate 1',
                'staff_id' => 'STF-1044',
                'job_title' => 'Security Gate Lead',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Mike+Warden&background=4B5563&color=fff&bold=true',
                'requested_at' => null,
            ],
            [
                'name' => 'Marcus Reed',
                'email' => 'm.reed@lincolnestate.com',
                'phone' => '+234 804 567 8901',
                'role' => 'agent',
                'status' => 'pending',
                'unit_number' => null,
                'staff_id' => 'STF-PEND',
                'job_title' => 'Leasing Agent',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Marcus+Reed&background=BAE6FD&color=0369A1&bold=true',
                'requested_at' => now()->subDays(17),
            ],
            [
                'name' => 'David Chen',
                'email' => 'd.chen@lincolnestate.com',
                'phone' => '+234 805 678 9012',
                'role' => 'maintenance',
                'status' => 'suspended',
                'unit_number' => null,
                'staff_id' => 'STF-3391',
                'job_title' => 'Maintenance Tech',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'requested_at' => null,
            ],
            [
                'name' => 'Amaka Eze',
                'email' => 'amaka.eze@example.com',
                'phone' => '+234 806 789 0123',
                'role' => 'resident',
                'status' => 'active',
                'unit_number' => 'Duplex 12',
                'staff_id' => null,
                'job_title' => 'Resident Member',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'requested_at' => null,
            ],
            [
                'name' => 'Tunde Bakare',
                'email' => 'tunde.b@lincolnestate.com',
                'phone' => '+234 807 890 1234',
                'role' => 'maintenance',
                'status' => 'active',
                'unit_number' => null,
                'staff_id' => 'STF-2890',
                'job_title' => 'Lead Electrical Engineer',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Tunde+Bakare&background=0A5C36&color=fff&bold=true',
                'requested_at' => null,
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => Hash::make('LincolnEstate2024!'),
                    'last_active_at' => now(),
                ])
            );
        }
    }
}
