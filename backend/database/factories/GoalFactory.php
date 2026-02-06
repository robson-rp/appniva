<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Goal>
 */
class GoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => Profile::factory(),
            'name' => $this->faker->randomElement(['Emergency Fund', 'Vacation', 'New Car', 'House Down Payment', 'Retirement']),
            'target_amount' => $this->faker->randomFloat(2, 50000, 5000000),
            'current_saved_amount' => $this->faker->randomFloat(2, 0, 50000),
            'target_date' => $this->faker->dateTimeBetween('+1 month', '+5 years')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['active', 'completed', 'abandoned']),
            'currency' => 'AOA',
        ];
    }
}
