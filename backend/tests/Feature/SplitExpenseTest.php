<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\SplitExpense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SplitExpenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_split_expense(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $data = [
            'description' => 'Dinner with friends',
            'total_amount' => 12000.50,
            'expense_date' => '2026-02-06',
            'currency' => 'AOA',
        ];

        $response = $this->postJson('/api/v1/split-expenses', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.description', 'Dinner with friends');

        $this->assertDatabaseHas('split_expenses', [
            'creator_id' => $profile->id,
            'description' => 'Dinner with friends',
        ]);
    }

    public function test_user_can_list_their_split_expenses(): void
    {
        $profile = Profile::factory()->create();
        SplitExpense::factory()->count(3)->create(['creator_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/split-expenses');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_update_their_split_expense(): void
    {
        $profile = Profile::factory()->create();
        $expense = SplitExpense::factory()->create(['creator_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/split-expenses/{$expense->id}", [
            'description' => 'Updated Description',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('split_expenses', [
            'id' => $expense->id,
            'description' => 'Updated Description',
        ]);
    }

    public function test_user_can_delete_their_split_expense(): void
    {
        $profile = Profile::factory()->create();
        $expense = SplitExpense::factory()->create(['creator_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/split-expenses/{$expense->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('split_expenses', ['id' => $expense->id]);
    }

    public function test_user_cannot_access_another_users_split_expense(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $expense = SplitExpense::factory()->create(['creator_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/split-expenses/{$expense->id}");

        $response->assertStatus(403);
    }
}
