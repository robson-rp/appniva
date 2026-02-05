<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
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
            'account_id' => Account::factory()->create(['user_id' => $profile->id]),
            'amount' => $this->faker->randomFloat(2, 10, 10000),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'date' => $this->faker->date(),
            'description' => $this->faker->sentence(),
            'category_id' => Category::factory()->create(['user_id' => $profile->id]),
            'cost_center_id' => null,
            'related_account_id' => null,
        ];
    }
}
