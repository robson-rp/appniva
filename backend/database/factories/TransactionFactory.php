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
        $type = $this->faker->randomElement(['income', 'expense', 'transfer']);

        return [
            'user_id' => Profile::factory(),
            'account_id' => Account::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 10000),
            'type' => $type,
            'date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'description' => $this->faker->sentence(),
            'category_id' => Category::factory(),
            'cost_center_id' => null,
            'related_account_id' => $type === 'transfer' ? Account::factory() : null,
        ];
    }

    /**
     * Indicate that the transaction is an expense.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'related_account_id' => null,
        ]);
    }

    /**
     * Indicate that the transaction is income.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
            'related_account_id' => null,
        ]);
    }

    /**
     * Indicate that the transaction is a transfer.
     */
    public function transfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'transfer',
            'related_account_id' => Account::factory(),
        ]);
    }
}
