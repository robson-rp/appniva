<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'];

        return [
            'user_id' => Profile::factory(),
            'name' => $this->faker->word() . '-' . $this->faker->randomNumber(4),
            'color' => $this->faker->randomElement($colors),
        ];
    }
}
