<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RecurringTransaction>
 */
class RecurringTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-6 months', 'now');
        $frequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'];
        $frequency = $this->faker->randomElement($frequencies);

        return [
            'user_id' => \App\Models\Profile::factory(),
            'account_id' => \App\Models\Account::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 5000),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'frequency' => $frequency,
            'description' => $this->faker->sentence(),
            'is_active' => $this->faker->boolean(85),
            'start_date' => $startDate,
            'end_date' => $this->faker->optional(0.3)->dateTimeBetween($startDate, '+2 years'),
            'last_executed_at' => $this->faker->optional(0.7)->dateTimeBetween($startDate, 'now'),
            'next_execution_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'category_id' => \App\Models\Category::factory(),
        ];
    }
}
