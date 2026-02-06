<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test unauthenticated user cannot access transactions
     */
    public function test_unauthenticated_user_cannot_access_transactions(): void
    {
        $response = $this->getJson('/api/v1/transactions');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can list their transactions
     */
    public function test_user_can_list_their_transactions(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);
        $category = Category::factory()->create(['user_id' => $profile->id]);

        Transaction::factory()->count(5)->create([
            'user_id' => $profile->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
        ]);

        // Create transactions for another user
        $otherProfile = Profile::factory()->create();
        $otherAccount = Account::factory()->create(['user_id' => $otherProfile->id]);
        $otherCategory = Category::factory()->create(['user_id' => $otherProfile->id]);
        Transaction::factory()->count(3)->create([
            'user_id' => $otherProfile->id,
            'account_id' => $otherAccount->id,
            'category_id' => $otherCategory->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/transactions');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    /**
     * Test user can create a transaction
     */
    public function test_user_can_create_transaction(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);
        $category = Category::factory()->create(['user_id' => $profile->id, 'type' => 'expense']);

        Sanctum::actingAs($profile, ['*']);

        $transactionData = [
            'account_id' => $account->id,
            'amount' => 5000.00,
            'type' => 'expense',
            'date' => '2026-02-05',
            'description' => 'Grocery shopping',
            'category_id' => $category->id,
        ];

        $response = $this->postJson('/api/v1/transactions', $transactionData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.description', 'Grocery shopping');
        
        $this->assertEquals(5000.00, $response->json('data.amount'));

        $this->assertDatabaseHas('transactions', [
            'account_id' => $account->id,
            'description' => 'Grocery shopping',
        ]);
    }

    /**
     * Test user cannot create transaction without required fields
     */
    public function test_user_cannot_create_transaction_without_required_fields(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $response = $this->postJson('/api/v1/transactions', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['account_id', 'amount', 'type', 'date']);
    }

    /**
     * Test user can view their own transaction
     */
    public function test_user_can_view_their_own_transaction(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);
        $category = Category::factory()->create(['user_id' => $profile->id]);
        $transaction = Transaction::factory()->create([
            'user_id' => $profile->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/transactions/{$transaction->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $transaction->id);
    }

    /**
     * Test user cannot view another user's transaction
     */
    public function test_user_cannot_view_another_users_transaction(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $otherAccount = Account::factory()->create(['user_id' => $otherProfile->id]);
        $otherCategory = Category::factory()->create(['user_id' => $otherProfile->id]);
        $transaction = Transaction::factory()->create([
            'user_id' => $otherProfile->id,
            'account_id' => $otherAccount->id,
            'category_id' => $otherCategory->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/transactions/{$transaction->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can update their own transaction
     */
    public function test_user_can_update_their_own_transaction(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);
        $category = Category::factory()->create(['user_id' => $profile->id]);
        $transaction = Transaction::factory()->create([
            'user_id' => $profile->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'description' => 'Old description',
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/transactions/{$transaction->id}", [
            'description' => 'Updated description',
            'amount' => 7500.00,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.description', 'Updated description');

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'description' => 'Updated description',
        ]);
    }

    /**
     * Test user can delete their own transaction
     */
    public function test_user_can_delete_their_own_transaction(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);
        $category = Category::factory()->create(['user_id' => $profile->id]);
        $transaction = Transaction::factory()->create([
            'user_id' => $profile->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/transactions/{$transaction->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('transactions', [
            'id' => $transaction->id,
        ]);
    }
}
