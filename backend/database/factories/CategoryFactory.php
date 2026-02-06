<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
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
            'name' => $this->faker->words(2, true),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'icon' => $this->faker->randomElement(['💰', '🏠', '🚗', '🍔', '✈️', '🎓']),
            'color' => $this->faker->hexColor(),
            'is_default' => false,
        ];
    }
}
