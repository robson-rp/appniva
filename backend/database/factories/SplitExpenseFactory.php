<?php

namespace Database\Factories;

use App\Models\SplitExpense;
use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class SplitExpenseFactory extends Factory
{
    protected $model = SplitExpense::class;

    public function definition(): array
    {
        return [
            'creator_id' => Profile::factory(),
            'description' => $this->faker->sentence(3),
            'total_amount' => $this->faker->randomFloat(2, 100, 5000),
            'expense_date' => $this->faker->date(),
            'currency' => 'AOA',
            'is_settled' => $this->faker->boolean(20),
            'receipt_url' => $this->faker->optional()->url(),
            'share_token' => $this->faker->uuid(),
        ];
    }
}
