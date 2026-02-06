<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Investment>
 */
class InvestmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-2 years', '-1 month');
        $investmentTypes = ['term_deposit', 'bond', 'otnr', 'stock', 'mutual_fund', 'crypto'];

        return [
            'name' => $this->faker->words(3, true) . ' Investment',
            'investment_type' => $this->faker->randomElement($investmentTypes),
            'principal_amount' => $this->faker->randomFloat(2, 10000, 1000000),
            'start_date' => $startDate,
            'maturity_date' => $this->faker->optional(0.7)->dateTimeBetween($startDate, '+5 years'),
            'currency' => 'AOA',
            'institution_name' => $this->faker->optional()->company(),
        ];
    }
}
