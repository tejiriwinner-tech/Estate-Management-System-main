<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = App\Models\User::where('email', 'admin@lincolnestate.ng')->first();
if (!$admin) {
    echo "Admin not found\n";
    exit(1);
}

echo "Admin ID: " . $admin->id . "\n";

// Check if admin already has a store
$store = App\Models\Store::where('owner_id', $admin->id)->first();
if (!$store) {
    $store = App\Models\Store::create([
        'owner_id' => $admin->id,
        'name' => 'Lincoln Central Mart',
        'category' => 'Estate Supplies & Groceries',
        'phone' => '+234 802 555 0148',
        'address' => 'Plot 4, Commercial Hub, Lincoln Estate, Lagos',
        'description' => 'Official central store for Lincoln Estate residents offering daily groceries, security gadgets, and home maintenance utilities.',
        'plan' => 'Enterprise',
        'is_open' => true,
        'open_weekends' => true,
        'settlement_method' => 'Direct Bank Transfer',
        'settlement_frequency' => 'Weekly',
    ]);
    echo "Created store: " . $store->name . " (ID: " . $store->id . ")\n";
} else {
    echo "Store already exists: " . $store->name . " (ID: " . $store->id . ")\n";
}

// Seed default products if empty
$productCount = App\Models\StoreProduct::where('store_id', $store->id)->count();
if ($productCount === 0) {
    $products = [
        [
            'name' => 'Estate RFID Access Card',
            'sku' => 'ACC-001',
            'category' => 'Security & Access',
            'price_kobo' => 500000, // 5,000 NGN
            'stock' => 45,
            'description' => 'Replacement smart RFID access card for main security gate barrier and club facilities.',
            'image' => '/figma/200b25cb-7213-4a5b-90eb-9149eb8a91d5.png',
            'featured' => true,
        ],
        [
            'name' => 'Solar Perimeter Sensor Lamp',
            'sku' => 'LGT-004',
            'category' => 'Lighting & Electrical',
            'price_kobo' => 2450000, // 24,500 NGN
            'stock' => 18,
            'description' => 'Automatic outdoor motion sensor LED solar spotlight for residential driveways and gardens.',
            'image' => '/figma/200b25cb-7213-4a5b-90eb-9149eb8a91d5.png',
            'featured' => true,
        ],
        [
            'name' => 'Prepaid Water Filtration Core',
            'sku' => 'WTR-012',
            'category' => 'Utilities & Plumbing',
            'price_kobo' => 1800000, // 18,000 NGN
            'stock' => 30,
            'description' => 'Multi-stage sediment and carbon replacement water filter cartridge for residential purifiers.',
            'image' => '/figma/200b25cb-7213-4a5b-90eb-9149eb8a91d5.png',
            'featured' => false,
        ],
        [
            'name' => 'Automated Gate Remote Clicker',
            'sku' => 'REM-009',
            'category' => 'Security & Access',
            'price_kobo' => 1250000, // 12,500 NGN
            'stock' => 12,
            'description' => 'Dual-channel encrypted rolling code remote transmitter for automated residential entrance gates.',
            'image' => '/figma/200b25cb-7213-4a5b-90eb-9149eb8a91d5.png',
            'featured' => true,
        ],
        [
            'name' => 'Heavy Duty Garden Hose (30m)',
            'sku' => 'GDN-003',
            'category' => 'Home & Maintenance',
            'price_kobo' => 1500000, // 15,000 NGN
            'stock' => 8,
            'description' => 'Kink-resistant 4-ply reinforced garden hose complete with brass quick-connect nozzles.',
            'image' => '/figma/200b25cb-7213-4a5b-90eb-9149eb8a91d5.png',
            'featured' => false,
        ],
    ];

    foreach ($products as $p) {
        App\Models\StoreProduct::create($p + ['store_id' => $store->id]);
    }
    echo "Seeded " . count($products) . " products for " . $store->name . "\n";
} else {
    echo "Store already has " . $productCount . " products.\n";
}
