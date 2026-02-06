<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\SchoolFee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolFee>
 */
class SchoolFeeFactory extends Factory
{
    protected $model = SchoolFee::class;

    public function definition(): array
    {
        return [
            'user_id' => Profile::factory(),
            'school_name' => $this->faker->company() . ' School',
            'student_name' => $this->faker->name(),
            'amount' => $this->faker->randomFloat(2, 50000, 200000),
            'academic_year' => '2024',
            'due_date' => $this->faker->date(),
            'education_level' => $this->faker->randomElement(['Primary', 'Secondary', 'University']),
            'fee_type' => 'Tuition',
            'paid' => $this->faker->boolean(50),
            'payment_proof_url' => $this->faker->optional()->url(),
        ];
    }
}
