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
        $startDate = $this->faker->dateTimeBetween('-2 years', 'now');

        return [
            'user_id' => Profile::factory(),
            'name' => $this->faker->randomElement(['Car Loan', 'Credit Card', 'Personal Loan', 'Mortgage', 'Student Loan']),
            'creditor' => $this->faker->company(),
            'amount' => $this->faker->randomFloat(2, 10000, 1000000),
            'interest_rate' => $this->faker->randomFloat(2, 5, 25),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $this->faker->dateTimeBetween($startDate, '+10 years')->format('Y-m-d'),
            'type' => $this->faker->randomElement(['credit_card', 'personal_loan', 'mortgage', 'car_loan', 'student_loan']),
            'status' => $this->faker->randomElement(['active', 'paid_off', 'defaulted']),
        ];
    }
}
