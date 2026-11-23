<?php
use App\Models\User;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$agent = User::where('role', 'agent')->first() ?? User::first();

$sampleListings = [
    [
        'agent_id' => $agent->id,
        'title' => 'Luxury 4-Bedroom Terrace Duplex',
        'description' => 'Beautifully finished modern terrace duplex located in the serene Phase 1 zone of Lincoln Estate. Features 24/7 power, treated water, and dedicated security.',
        'property_type' => 'Duplex',
        'listing_type' => 'rent',
        'price_kobo' => 450000000, // stored in kobo: 4.5M Naira
        'price_period' => 'per_year',
        'address' => 'Plot 14, Palm Crescent',
        'zone' => 'Phase 1',
        'beds' => 4,
        'baths' => 4,
        'photos' => json_encode(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']),
        'approval_status' => 'approved',
        'availability' => 'available',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'agent_id' => $agent->id,
        'title' => 'Executive 3-Bedroom Furnished Apartment',
        'description' => 'Spacious modern flat with premium fittings, all rooms en-suite, fitted kitchen with heat extractor, and ample parking space.',
        'property_type' => 'Apartment',
        'listing_type' => 'rent',
        'price_kobo' => 320000000, // 3.2M Naira
        'price_period' => 'per_year',
        'address' => 'Block B4, Royal Avenue',
        'zone' => 'Phase 1',
        'beds' => 3,
        'baths' => 3,
        'photos' => json_encode(['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80']),
        'approval_status' => 'approved',
        'availability' => 'available',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'agent_id' => $agent->id,
        'title' => 'Contemporary 5-Bedroom Detached Villa',
        'description' => 'Contemporary luxury villa for sale with private swimming pool, smart home automation, high ceiling living room, and spacious grounds.',
        'property_type' => 'Detached',
        'listing_type' => 'sale',
        'price_kobo' => 12500000000, // 125M Naira
        'price_period' => null,
        'address' => 'Hilltop Boulevard',
        'zone' => 'Phase 1',
        'beds' => 5,
        'baths' => 6,
        'photos' => json_encode(['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80']),
        'approval_status' => 'approved',
        'availability' => 'available',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'agent_id' => $agent->id,
        'title' => 'Cozy 2-Bedroom Serviced Flat',
        'description' => 'Ideal for young professionals and small families. Fully serviced with clean surroundings, recreational park access, and quiet neighborhood.',
        'property_type' => 'Apartment',
        'listing_type' => 'rent',
        'price_kobo' => 200000000, // 2M Naira
        'price_period' => 'per_year',
        'address' => 'Avenue 5, Lincoln Central',
        'zone' => 'Phase 2',
        'beds' => 2,
        'baths' => 2,
        'photos' => json_encode(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80']),
        'approval_status' => 'approved',
        'availability' => 'available',
        'created_at' => now(),
        'updated_at' => now(),
    ],
];

foreach ($sampleListings as $listing) {
    DB::table('listings')->updateOrInsert(
        ['title' => $listing['title']],
        $listing
    );
}

echo "Created " . count($sampleListings) . " approved listings with images in database.\n";
