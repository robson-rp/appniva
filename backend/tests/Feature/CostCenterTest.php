<?php

namespace Tests\Feature;

use App\Models\CostCenter;
use App\Models\CostCenterBudget;
use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CostCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_cost_center(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $data = [
            'name' => 'Marketing Department',
            'type' => 'expense',
            'description' => 'Marketing expenses for 2026',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/cost-centers', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Marketing Department');

        $this->assertDatabaseHas('cost_centers', [
            'user_id' => $profile->id,
            'name' => 'Marketing Department',
        ]);
    }

    public function test_user_can_create_cost_center_budget(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $costCenter = CostCenter::factory()->create(['user_id' => $profile->id]);

        $data = [
            'cost_center_id' => $costCenter->id,
            'month' => '2026-02',
            'amount_limit' => 5000.00,
            'alert_threshold' => 85,
        ];

        $response = $this->postJson('/api/v1/cost-center-budgets', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.amount_limit', 5000);

        $this->assertDatabaseHas('cost_center_budgets', [
            'user_id' => $profile->id,
            'cost_center_id' => $costCenter->id,
            'month' => '2026-02',
        ]);
    }

    public function test_user_can_list_their_cost_centers(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        CostCenter::factory()->count(3)->create(['user_id' => $profile->id]);

        $response = $this->getJson('/api/v1/cost-centers');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_update_their_cost_center(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $costCenter = CostCenter::factory()->create(['user_id' => $profile->id]);

        $response = $this->putJson("/api/v1/cost-centers/{$costCenter->id}", [
            'name' => 'Updated Department'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Updated Department');
    }

    public function test_user_can_delete_their_cost_center(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $costCenter = CostCenter::factory()->create(['user_id' => $profile->id]);

        $response = $this->deleteJson("/api/v1/cost-centers/{$costCenter->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('cost_centers', ['id' => $costCenter->id]);
    }
}
