<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Category;
use App\Models\Budget;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test unauthenticated user cannot access budgets
     */
    public function test_unauthenticated_user_cannot_access_budgets(): void
    {
        $response = $this->getJson('/api/v1/budgets');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can list their budgets
     */
    public function test_user_can_list_their_budgets(): void
    {
        $profile = Profile::factory()->create();
        $account = Category::factory()->create(['user_id' => $profile->id]);
        
        // Create 5 budgets for the user
        Budget::factory()->count(5)->create([
            'user_id' => $profile->id,
        ]);

        // Create budgets for another user
        $otherProfile = Profile::factory()->create();
        Budget::factory()->count(3)->create([
            'user_id' => $otherProfile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/budgets');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    /**
     * Test user can create a budget
     */
    public function test_user_can_create_budget(): void
    {
        $profile = Profile::factory()->create();
        $category = Category::factory()->create(['user_id' => $profile->id, 'type' => 'expense']);

        Sanctum::actingAs($profile, ['*']);

        $budgetData = [
            'category_id' => $category->id,
            'month' => '2026-03',
            'amount_limit' => 50000.00,
        ];

        $response = $this->postJson('/api/v1/budgets', $budgetData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.month', '2026-03');
        
        $this->assertEquals(50000.00, $response->json('data.amount_limit'));

        $this->assertDatabaseHas('budgets', [
            'user_id' => $profile->id,
            'category_id' => $category->id,
            'month' => '2026-03',
        ]);
    }

    /**
     * Test user can view their own budget
     */
    public function test_user_can_view_their_own_budget(): void
    {
        $profile = Profile::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $profile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/budgets/{$budget->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $budget->id);
    }

    /**
     * Test user cannot view another user's budget
     */
    public function test_user_cannot_view_another_users_budget(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $otherProfile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/budgets/{$budget->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can update their own budget
     */
    public function test_user_can_update_their_own_budget(): void
    {
        $profile = Profile::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $profile->id,
            'amount_limit' => 30000.00,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/budgets/{$budget->id}", [
            'amount_limit' => 45000.00,
        ]);

        $response->assertStatus(200);
        
        $this->assertEquals(45000.00, $response->json('data.amount_limit'));

        $this->assertDatabaseHas('budgets', [
            'id' => $budget->id,
            'amount_limit' => 45000.00,
        ]);
    }

    /**
     * Test user can delete their own budget
     */
    public function test_user_can_delete_their_own_budget(): void
    {
        $profile = Profile::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $profile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/budgets/{$budget->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('budgets', [
            'id' => $budget->id,
        ]);
    }
}
