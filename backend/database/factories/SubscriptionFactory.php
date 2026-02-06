<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $services = ['Netflix', 'Spotify', 'Amazon Prime', 'Disney+', 'Apple Music', 'YouTube Premium', 'Microsoft 365', 'Adobe Creative Cloud'];

        return [
            'name' => $this->faker->randomElement($services),
            'amount' => $this->faker->randomFloat(2, 5, 150),
            'billing_cycle' => $this->faker->randomElement(['monthly', 'quarterly', 'annual']),
            'next_renewal_date' => $this->faker->dateTimeBetween('now', '+90 days'),
            'is_active' => $this->faker->boolean(85),
            'category_id' => \App\Models\Category::factory(),
            'account_id' => \App\Models\Account::factory(),
            'alert_days_before' => $this->faker->randomElement([3, 7, 14, 30]),
        ];
    }
}
