<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$store = App\Models\Store::where('name', 'Lincoln Central Mart')->first();
if (!$store) {
    echo "Store not found\n";
    exit(1);
}

$images = [
    'ACC-001' => '/assets/products/inventory-1.jpeg',
    'LGT-004' => '/assets/products/catalog-1.jpeg',
    'WTR-012' => '/assets/products/catalog-2.jpeg',
    'REM-009' => '/assets/products/inventory-2.jpeg',
    'GDN-003' => '/assets/products/catalog-5.jpeg',
];

foreach ($images as $sku => $img) {
    $p = App\Models\StoreProduct::where('store_id', $store->id)->where('sku', $sku)->first();
    if ($p) {
        $p->update(['image' => $img]);
        echo "Updated image for {$sku}\n";
    }
}
echo "Done updating product images.\n";
