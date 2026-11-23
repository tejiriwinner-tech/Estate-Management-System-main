<?php

namespace Database\Factories;

use App\Models\Merchant;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'merchant_id' => Merchant::factory(),
            'service' => fake()->words(2, true),
            'invoice' => fake()->unique()->numerify('INV-####'),
            'amount' => fake()->numberBetween(1000, 100000),
            'transaction_date' => fake()->date(),
            'status' => 'paid',
        ];
    }
}
