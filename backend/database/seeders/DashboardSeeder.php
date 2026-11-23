<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reminder;
use App\Models\EstateUpdate;

class DashboardSeeder extends Seeder
{
    public function run(): void
    {
        // Default Reminders matching Figma design
        $reminders = [
            [
                'text' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
                'due_time' => '9:30am',
                'is_completed' => false,
            ],
            [
                'text' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
                'due_time' => '9:30am',
                'is_completed' => false,
            ],
            [
                'text' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
                'due_time' => '9:30am',
                'is_completed' => false,
            ],
        ];

        foreach ($reminders as $item) {
            Reminder::create($item);
        }

        // Estate Update Announcement matching Figma design
        EstateUpdate::create([
            'headline_prefix' => 'Update From ',
            'headline_highlight' => 'Estate Admin',
            'image_url' => 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&w=1200&q=80',
            'image_alt' => 'Estate Security Patrol Vehicles',
            'lead_paragraph' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'body_paragraph' => 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
            'category' => 'Security & Operations',
            'author_name' => 'Chief Security Officer',
            'author_role' => 'Estate Operations',
            'published_at' => now(),
        ]);
    }
}

