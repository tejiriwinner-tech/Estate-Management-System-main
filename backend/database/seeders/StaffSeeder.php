<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StaffActivity;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $staffMembers = [
            [
                'name' => 'Bessie Cooper',
                'email' => 'bessie.cooper@lincolnestate.com',
                'phone' => '+1 (555) 902-3412',
                'role' => 'manager',
                'job_title' => 'Senior Property Manager',
                'department' => 'Sales & Leasing',
                'staff_id' => '#LE-2041',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Sarah Jenkins',
                'email' => 's.jenkins@lincolnestate.com',
                'phone' => '+234 802 111 2233',
                'role' => 'manager',
                'job_title' => 'Senior Property Consultant',
                'department' => 'Operations',
                'staff_id' => '#LE-4492',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Marcus Thorne',
                'email' => 'm.thorne@lincolnestate.com',
                'phone' => '+234 803 222 3344',
                'role' => 'finance',
                'job_title' => 'Financial Operations',
                'department' => 'Finance',
                'staff_id' => '#LE-5102',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'David Chen',
                'email' => 'd.chen@lincolnestate.com',
                'phone' => '+234 804 333 4455',
                'role' => 'counsel',
                'job_title' => 'Legal Counsel',
                'department' => 'Legal & Compliance',
                'staff_id' => '#LE-2931',
                'status' => 'suspended',
                'avatar_url' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Elena Rodriguez',
                'email' => 'e.rodriguez@lincolnestate.com',
                'phone' => '+234 805 444 5566',
                'role' => 'marketing',
                'job_title' => 'Marketing Lead',
                'department' => 'Marketing',
                'staff_id' => '#LE-6022',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Samuel Okafor',
                'email' => 's.okafor@lincolnestate.com',
                'phone' => '+234 806 555 6677',
                'role' => 'maintenance',
                'job_title' => 'Maintenance Supervisor',
                'department' => 'Facility Management',
                'staff_id' => '#LE-3829',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Chloe Whittaker',
                'email' => 'c.whittaker@lincolnestate.com',
                'phone' => '+234 807 666 7788',
                'role' => 'liaison',
                'job_title' => 'Tenant Liaison',
                'department' => 'Resident Relations',
                'staff_id' => '#LE-4110',
                'status' => 'active',
                'avatar_url' => 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
            ],
        ];

        foreach ($staffMembers as $member) {
            User::updateOrCreate(
                ['staff_id' => $member['staff_id']],
                array_merge($member, [
                    'password' => Hash::make('LincolnEstate2024!'),
                    'last_active_at' => now(),
                ])
            );
        }

        // Seed Activity Timeline matching Figma
        $activities = [
            [
                'staff_name' => 'Sarah Jenkins',
                'action_text' => 'updated status for',
                'target_entity' => "'Greenview Villas'.",
                'timestamp_display' => '10:45 AM Today',
                'dot_color' => 'gold',
            ],
            [
                'staff_name' => 'Admin',
                'action_text' => 'added a new staff member:',
                'target_entity' => 'Elena Rodriguez.',
                'timestamp_display' => '09:12 AM Today',
                'dot_color' => 'gold',
            ],
            [
                'staff_name' => 'System alert:',
                'action_text' => "David Chen's access credentials",
                'target_entity' => 'suspended.',
                'timestamp_display' => 'Yesterday',
                'dot_color' => 'red',
            ],
            [
                'staff_name' => 'Marcus Thorne',
                'action_text' => 'generated monthly',
                'target_entity' => 'financial report.',
                'timestamp_display' => '2 days ago',
                'dot_color' => 'gold',
            ],
        ];

        foreach ($activities as $act) {
            StaffActivity::create($act);
        }
    }
}
