<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
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
            'name' => $this->faker->words(2, true) . ' Account',
            'type' => $this->faker->randomElement(['checking', 'savings', 'investment', 'cash']),
            'currency' => 'AOA',
            'current_balance' => $this->faker->randomFloat(2, 0, 1000000),
            'initial_balance' => $this->faker->randomFloat(2, 0, 100000),
            'institution_name' => $this->faker->optional()->company(),
            'is_active' => true,
        ];
    }
}
