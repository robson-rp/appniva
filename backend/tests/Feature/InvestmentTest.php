<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Investment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvestmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can create an investment
     */
    public function test_user_can_create_investment(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $investmentData = [
            'name' => 'Tesla Stock',
            'investment_type' => 'stock',
            'principal_amount' => 5000.00,
            'start_date' => '2026-01-01',
            'currency' => 'USD',
            'institution_name' => 'Interactive Brokers',
        ];

        $response = $this->postJson('/api/v1/investments', $investmentData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Tesla Stock');

        $this->assertDatabaseHas('investments', [
            'user_id' => $profile->id,
            'name' => 'Tesla Stock',
        ]);
    }

    /**
     * Test user can list their investments
     */
    public function test_user_can_list_their_investments(): void
    {
        $profile = Profile::factory()->create();
        Investment::factory()->count(3)->create(['user_id' => $profile->id]);

        $otherProfile = Profile::factory()->create();
        Investment::factory()->count(2)->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/investments');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    /**
     * Test user can update their investment
     */
    public function test_user_can_update_their_investment(): void
    {
        $profile = Profile::factory()->create();
        $investment = Investment::factory()->create([
            'user_id' => $profile->id,
            'principal_amount' => 1000.00
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/investments/{$investment->id}", [
            'principal_amount' => 1500.00,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'principal_amount' => 1500.00,
        ]);
    }

    /**
     * Test user can delete their investment
     */
    public function test_user_can_delete_their_investment(): void
    {
        $profile = Profile::factory()->create();
        $investment = Investment::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/investments/{$investment->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('investments', [
            'id' => $investment->id,
        ]);
    }

    /**
     * Test user cannot access another user's investment
     */
    public function test_user_cannot_access_another_users_investment(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $investment = Investment::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/investments/{$investment->id}");

        $response->assertStatus(403);
    }
}
