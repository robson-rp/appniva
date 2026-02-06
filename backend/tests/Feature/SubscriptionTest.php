<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Subscription;
use App\Models\Category;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can create a subscription
     */
    public function test_user_can_create_subscription(): void
    {
        $profile = Profile::factory()->create();
        $category = Category::factory()->create(['user_id' => $profile->id]);
        $account = Account::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $subscriptionData = [
            'name' => 'Netflix',
            'amount' => 15.99,
            'billing_cycle' => 'monthly',
            'next_renewal_date' => '2026-03-01',
            'category_id' => $category->id,
            'account_id' => $account->id,
            'alert_days_before' => 3,
        ];

        $response = $this->postJson('/api/v1/subscriptions', $subscriptionData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Netflix');

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $profile->id,
            'name' => 'Netflix',
        ]);
    }

    /**
     * Test user can list their subscriptions
     */
    public function test_user_can_list_their_subscriptions(): void
    {
        $profile = Profile::factory()->create();
        Subscription::factory()->count(4)->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/subscriptions');

        $response->assertStatus(200)
                 ->assertJsonCount(4, 'data');
    }

    /**
     * Test user can update their subscription
     */
    public function test_user_can_update_their_subscription(): void
    {
        $profile = Profile::factory()->create();
        $subscription = Subscription::factory()->create([
            'user_id' => $profile->id,
            'amount' => 10.00
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/subscriptions/{$subscription->id}", [
            'amount' => 12.00,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'amount' => 12.00,
        ]);
    }

    /**
     * Test user can delete their subscription
     */
    public function test_user_can_delete_their_subscription(): void
    {
        $profile = Profile::factory()->create();
        $subscription = Subscription::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('subscriptions', [
            'id' => $subscription->id,
        ]);
    }

    /**
     * Test user cannot access another user's subscription
     */
    public function test_user_cannot_access_another_users_subscription(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $subscription = Subscription::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/subscriptions/{$subscription->id}");

        $response->assertStatus(403);
    }
}
