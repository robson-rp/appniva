<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $profile = Profile::factory()->create();

        return [
            'user_id' => $profile->id,
            'category_id' => Category::factory()->create(['user_id' => $profile->id, 'type' => 'expense']),
            'month' => $this->faker->dateTimeBetween('-6 months', '+6 months')->format('Y-m'),
            'amount_limit' => $this->faker->randomFloat(2, 10000, 200000),
        ];
    }
}
