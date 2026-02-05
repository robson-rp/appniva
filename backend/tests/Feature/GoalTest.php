<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Goal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_goal(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $goalData = [
            'name' => 'Emergency Fund',
            'target_amount' => 100000.00,
            'current_amount' => 0,
            'deadline' => '2027-12-31',
            'category' => 'savings',
            'priority' => 'high',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/goals', $goalData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Emergency Fund');

        $this->assertDatabaseHas('goals', [
            'user_id' => $profile->id,
            'name' => 'Emergency Fund',
        ]);
    }

    public function test_user_can_list_their_goals(): void
    {
        $profile = Profile::factory()->create();
        Goal::factory()->count(3)->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/goals');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_update_goal(): void
    {
        $profile = Profile::factory()->create();
        $goal = Goal::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/goals/{$goal->id}", [
            'current_amount' => 50000.00,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('goals', [
            'id' => $goal->id,
            'current_amount' => 50000.00,
        ]);
    }

    public function test_user_can_delete_goal(): void
    {
        $profile = Profile::factory()->create();
        $goal = Goal::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/goals/{$goal->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('goals', [
            'id' => $goal->id,
        ]);
    }

    public function test_user_cannot_view_another_users_goal(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $goal = Goal::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/goals/{$goal->id}");

        $response->assertStatus(403);
    }
}
