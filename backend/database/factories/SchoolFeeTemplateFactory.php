<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\SchoolFeeTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolFeeTemplate>
 */
class SchoolFeeTemplateFactory extends Factory
{
    protected $model = SchoolFeeTemplate::class;

    public function definition(): array
    {
        return [
            'user_id' => Profile::factory(),
            'name' => 'Monthly Fee Template',
            'school_name' => $this->faker->company() . ' School',
            'amount' => $this->faker->randomFloat(2, 50000, 200000),
            'education_level' => $this->faker->randomElement(['Primary', 'Secondary', 'University']),
            'fee_type' => 'Tuition',
            'is_recurring' => true,
        ];
    }
}
