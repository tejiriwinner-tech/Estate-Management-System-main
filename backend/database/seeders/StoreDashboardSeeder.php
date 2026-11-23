<?php

namespace Database\Seeders;

use App\Models\Merchant;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class StoreDashboardSeeder extends Seeder
{
    public function run(): void
    {
        $merchant = Merchant::query()->updateOrCreate(
            ['merchant_id' => 'KC-8842'],
            [
                'name' => 'Kinetic Commerce',
                'joined_at' => '2023-10-24',
                'tier' => 'Premier Merchant',
                'total_revenue' => 14250000,
                'pending_settlements' => 842000,
                'active_products' => 1248,
                'order_volume' => 4821,
                'settlement_mode' => 'Bank Transfer',
                'settlement_frequency' => 'Quarterly',
                'auto_pay_enabled' => false,
                'document_name' => 'Lease Agreement',
            ],
        );

        $transactions = [
            ['service' => 'Premium Insurance', 'invoice' => 'INV-#4402', 'amount' => 45000, 'transaction_date' => '2023-10-24'],
            ['service' => 'Warehousing Fee', 'invoice' => 'INV-#4401', 'amount' => 12500, 'transaction_date' => '2023-09-28'],
            ['service' => 'Logistics Bulk', 'invoice' => 'INV-#4398', 'amount' => 25000, 'transaction_date' => '2023-09-15'],
        ];

        foreach ($transactions as $transaction) {
            Transaction::query()->updateOrCreate(
                ['invoice' => $transaction['invoice']],
                [...$transaction, 'merchant_id' => $merchant->id, 'status' => 'paid'],
            );
        }
    }
}
