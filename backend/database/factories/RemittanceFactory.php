<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\Remittance;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Remittance>
 */
class RemittanceFactory extends Factory
{
    protected $model = Remittance::class;

    public function definition(): array
    {
        $amountSent = $this->faker->randomFloat(2, 100, 5000);
        $exchangeRate = 1.0;
        
        return [
            'user_id' => Profile::factory(),
            'sender_name' => $this->faker->name(),
            'recipient_name' => $this->faker->name(),
            'amount_sent' => $amountSent,
            'amount_received' => $amountSent * $exchangeRate,
            'currency_from' => 'AOA',
            'currency_to' => 'EUR',
            'exchange_rate' => $exchangeRate,
            'fee' => $this->faker->randomFloat(2, 5, 50),
            'service_provider' => $this->faker->randomElement(['Unitel Money', 'Wester Union', 'MoneyGram']),
            'transfer_date' => $this->faker->date(),
            'status' => 'completed',
        ];
    }
}
