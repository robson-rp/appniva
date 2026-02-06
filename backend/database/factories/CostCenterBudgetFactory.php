<?php

namespace Database\Factories;

use App\Models\CostCenterBudget;
use App\Models\CostCenter;
use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CostCenterBudget>
 */
class CostCenterBudgetFactory extends Factory
{
    protected $model = CostCenterBudget::class;

    public function definition(): array
    {
        return [
            'user_id' => Profile::factory(),
            'cost_center_id' => CostCenter::factory(),
            'month' => date('Y-m'),
            'amount_limit' => $this->faker->randomFloat(2, 1000, 10000),
            'alert_threshold' => 90,
        ];
    }
}
