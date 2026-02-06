<?php

namespace Database\Factories;

use App\Models\Kixikila;
use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class KixikilaFactory extends Factory
{
    protected $model = Kixikila::class;

    public function definition(): array
    {
        return [
            'user_id' => Profile::factory(),
            'name' => 'Kixikila ' . $this->faker->word(),
            'contribution_amount' => $this->faker->randomFloat(2, 5000, 50000),
            'frequency' => $this->faker->randomElement(['weekly', 'biweekly', 'monthly']),
            'current_round' => 1,
            'total_members' => $this->faker->numberBetween(5, 12),
            'status' => 'active',
            'currency' => 'AOA',
        ];
    }
}
