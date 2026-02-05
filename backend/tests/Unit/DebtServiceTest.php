<?php

namespace Tests\Unit;

use App\Models\Profile;
use App\Models\Debt;
use App\Services\DebtService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebtServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DebtService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DebtService();
    }

    /**
     * Test calculate remaining balance with no payments
     */
    public function test_calculate_remaining_balance_with_no_payments(): void
    {
        $profile = Profile::factory()->create();
        $debt = Debt::factory()->create([
            'user_id' => $profile->id,
            'amount' => 100000.00,
        ]);

        $remaining = $this->service->calculateRemainingBalance($debt);

        $this->assertEquals(100000.00, $remaining);
    }

    /**
     * Test calculate accrued interest
     */
    public function test_calculate_accrued_interest(): void
    {
        $profile = Profile::factory()->create();

        $startDate = Carbon::parse('2026-01-01');
        $debt = Debt::factory()->create([
            'user_id' => $profile->id,
            'amount' => 100000.00,
            'interest_rate' => 12.0, // 12% anual = 1% mensal
            'start_date' => $startDate,
        ]);

        // Calcular juros após 1 mês
        $interest = $this->service->calculateAccruedInterest(
            $debt,
            $startDate->copy()->addMonth()
        );

        // 100000 * 0.01 * 1 mês = 1000
        $this->assertEquals(1000.00, $interest);
    }

    /**
     * Test payoff schedule generation
     */
    public function test_payoff_schedule_generation(): void
    {
        $profile = Profile::factory()->create();

        $debt = Debt::factory()->create([
            'user_id' => $profile->id,
            'amount' => 12000.00,
            'interest_rate' => 12.0,
            'start_date' => now(),
        ]);

        $schedule = $this->service->getPayoffSchedule($debt, 1100);

        $this->assertNotEmpty($schedule);
        $this->assertArrayHasKey('month', $schedule[0]);
        $this->assertArrayHasKey('payment', $schedule[0]);
        $this->assertArrayHasKey('principal', $schedule[0]);
        $this->assertArrayHasKey('interest', $schedule[0]);
        $this->assertArrayHasKey('remaining_balance', $schedule[0]);
    }

    /**
     * Test remaining balance never goes negative
     */
    public function test_remaining_balance_never_negative(): void
    {
        $profile = Profile::factory()->create();
        $debt = Debt::factory()->create([
            'user_id' => $profile->id,
            'amount' => 50000.00,
        ]);

        $remaining = $this->service->calculateRemainingBalance($debt);

        $this->assertGreaterThanOrEqual(0, $remaining);
    }
}
