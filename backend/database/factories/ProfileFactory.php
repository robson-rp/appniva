<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => $this->faker->uuid(),
            'email' => $this->faker->unique()->safeEmail(),
            'name' => $this->faker->name(),
            'primary_currency' => 'AOA',
            'monthly_income' => $this->faker->numberBetween(50000, 500000),
            'onboarding_completed' => true,
            'is_suspended' => false,
        ];
    }
}
