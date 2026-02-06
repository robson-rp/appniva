<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Debt>
 */
class DebtFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $principalAmount = $this->faker->randomFloat(2, 10000, 1000000);

        return [
            'user_id' => Profile::factory(),
            'name' => $this->faker->randomElement(['Car Loan', 'Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan']),
            'principal_amount' => $principalAmount,
            'current_balance' => $this->faker->randomFloat(2, $principalAmount * 0.1, $principalAmount),
            'type' => $this->faker->randomElement(['credit_card', 'personal_loan', 'mortgage', 'auto_loan', 'student_loan', 'other']),
            'status' => $this->faker->randomElement(['active', 'paid_off', 'defaulted']),
            'interest_rate_annual' => $this->faker->randomFloat(4, 0.05, 0.25),
            'installment_frequency' => $this->faker->randomElement(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual']),
            'installment_amount' => $this->faker->randomFloat(2, 500, 10000),
            'next_payment_date' => $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
        ];
    }
}
