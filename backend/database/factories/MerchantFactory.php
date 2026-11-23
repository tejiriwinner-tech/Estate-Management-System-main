<?php

namespace Database\Factories;

use App\Models\Merchant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Merchant>
 */
class MerchantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'merchant_id' => fake()->unique()->bothify('KC-####'),
            'joined_at' => fake()->date(),
            'tier' => 'Premier Merchant',
            'total_revenue' => fake()->numberBetween(100000, 20000000),
            'pending_settlements' => fake()->numberBetween(0, 1000000),
            'active_products' => fake()->numberBetween(1, 2000),
            'order_volume' => fake()->numberBetween(1, 10000),
            'settlement_mode' => 'Bank Transfer',
            'settlement_frequency' => 'Quarterly',
            'auto_pay_enabled' => false,
            'document_name' => 'Lease Agreement',
        ];
    }
}
