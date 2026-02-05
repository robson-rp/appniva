<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Debt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DebtTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_debt(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $debtData = [
            'name' => 'Car Loan',
            'creditor' => 'BFA Bank',
            'amount' => 500000.00,
            'interest_rate' => 12.5,
            'start_date' => '2026-01-01',
            'end_date' => '2030-12-31',
            'type' => 'car_loan',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/debts', $debtData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Car Loan');

        $this->assertDatabaseHas('debts', [
            'user_id' => $profile->id,
            'name' => 'Car Loan',
        ]);
    }

    public function test_user_can_list_their_debts(): void
    {
        $profile = Profile::factory()->create();
        Debt::factory()->count(4)->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/debts');

        $response->assertStatus(200)
                 ->assertJsonCount(4, 'data');
    }

    public function test_user_can_update_debt_status(): void
    {
        $profile = Profile::factory()->create();
        $debt = Debt::factory()->create(['user_id' => $profile->id, 'status' => 'active']);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/debts/{$debt->id}", [
            'status' => 'paid_off',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('debts', [
            'id' => $debt->id,
            'status' => 'paid_off',
        ]);
    }

    public function test_user_can_delete_debt(): void
    {
        $profile = Profile::factory()->create();
        $debt = Debt::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/debts/{$debt->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('debts', [
            'id' => $debt->id,
        ]);
    }

    public function test_user_cannot_access_another_users_debt(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $debt = Debt::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/debts/{$debt->id}");

        $response->assertStatus(403);
    }
}
