<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Profile;
use App\Models\RecurringTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecurringTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_recurring_transaction(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $account = Account::factory()->create(['user_id' => $profile->id]);
        $category = Category::factory()->create(['user_id' => $profile->id]);

        $data = [
            'account_id' => $account->id,
            'amount' => 150.75,
            'type' => 'expense',
            'frequency' => 'monthly',
            'description' => 'Monthly Internet',
            'is_active' => true,
            'start_date' => '2026-02-01',
            'next_execution_date' => '2026-03-01',
            'category_id' => $category->id,
        ];

        $response = $this->postJson('/api/v1/recurring-transactions', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.amount', 150.75);

        $this->assertDatabaseHas('recurring_transactions', [
            'user_id' => $profile->id,
            'description' => 'Monthly Internet',
        ]);
    }

    public function test_user_can_list_their_recurring_transactions(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        RecurringTransaction::factory()->count(2)->create(['user_id' => $profile->id]);

        $response = $this->getJson('/api/v1/recurring-transactions');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    public function test_user_can_update_their_recurring_transaction(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $recurring = RecurringTransaction::factory()->create(['user_id' => $profile->id]);

        $response = $this->putJson("/api/v1/recurring-transactions/{$recurring->id}", [
            'amount' => 200.00
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.amount', 200);
    }

    public function test_user_cannot_access_another_users_recurring_transaction(): void
    {
        $profile1 = Profile::factory()->create();
        $profile2 = Profile::factory()->create();
        
        $recurring = RecurringTransaction::factory()->create(['user_id' => $profile1->id]);

        Sanctum::actingAs($profile2, ['*']);

        $this->getJson("/api/v1/recurring-transactions/{$recurring->id}")->assertStatus(403);
    }

    public function test_user_can_delete_their_recurring_transaction(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $recurring = RecurringTransaction::factory()->create(['user_id' => $profile->id]);

        $response = $this->deleteJson("/api/v1/recurring-transactions/{$recurring->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('recurring_transactions', ['id' => $recurring->id]);
    }
}
