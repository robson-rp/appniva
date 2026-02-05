<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test unauthenticated user cannot access accounts
     */
    public function test_unauthenticated_user_cannot_access_accounts(): void
    {
        $response = $this->getJson('/api/v1/accounts');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can list their accounts
     */
    public function test_user_can_list_their_accounts(): void
    {
        $profile = Profile::factory()->create();
        Account::factory()->count(3)->create(['user_id' => $profile->id]);

        // Create accounts for another user (should not be in response)
        $otherProfile = Profile::factory()->create();
        Account::factory()->count(2)->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/accounts');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    /**
     * Test user can create an account
     */
    public function test_user_can_create_account(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $accountData = [
            'name' => 'My Savings Account',
            'type' => 'savings',
            'currency' => 'AOA',
            'current_balance' => 50000.00,
            'initial_balance' => 50000.00,
            'institution_name' => 'BFA',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/accounts', $accountData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'My Savings Account')
                 ->assertJsonPath('data.type', 'savings');

        $this->assertDatabaseHas('accounts', [
            'name' => 'My Savings Account',
            'user_id' => $profile->id,
        ]);
    }

    /**
     * Test user cannot create account without required fields
     */
    public function test_user_cannot_create_account_without_required_fields(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $response = $this->postJson('/api/v1/accounts', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'type', 'currency']);
    }

    /**
     * Test user can view their own account
     */
    public function test_user_can_view_their_own_account(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/accounts/{$account->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $account->id)
                 ->assertJsonPath('data.name', $account->name);
    }

    /**
     * Test user cannot view another user's account
     */
    public function test_user_cannot_view_another_users_account(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/accounts/{$account->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can update their own account
     */
    public function test_user_can_update_their_own_account(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/accounts/{$account->id}", [
            'name' => 'Updated Account Name',
            'is_active' => false,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Updated Account Name');

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'name' => 'Updated Account Name',
            'is_active' => false,
        ]);
    }

    /**
     * Test user cannot update another user's account
     */
    public function test_user_cannot_update_another_users_account(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/accounts/{$account->id}", [
            'name' => 'Hacked Account',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can delete their own account
     */
    public function test_user_can_delete_their_own_account(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/accounts/{$account->id}");

        $response->assertStatus(204);

        // Verify soft delete
        $this->assertSoftDeleted('accounts', [
            'id' => $account->id,
        ]);
    }

    /**
     * Test user cannot delete another user's account
     */
    public function test_user_cannot_delete_another_users_account(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/accounts/{$account->id}");

        $response->assertStatus(403);

        // Verify account still exists
        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'deleted_at' => null,
        ]);
    }
}
