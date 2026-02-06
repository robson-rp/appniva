<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Remittance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RemittanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_remittance(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $data = [
            'sender_name' => 'John Doe',
            'recipient_name' => 'Jane Smith',
            'amount_sent' => 1000.00,
            'amount_received' => 950.00,
            'currency_from' => 'AOA',
            'currency_to' => 'EUR',
            'exchange_rate' => 0.95,
            'service_provider' => 'Unitel Money',
            'transfer_date' => '2026-02-06',
        ];

        $response = $this->postJson('/api/v1/remittances', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.sender_name', 'John Doe');

        $this->assertDatabaseHas('remittances', [
            'user_id' => $profile->id,
            'sender_name' => 'John Doe',
        ]);
    }

    public function test_user_can_list_their_remittances(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        Remittance::factory()->count(3)->create(['user_id' => $profile->id]);
        Remittance::factory()->create(); // Another user's remittance

        $response = $this->getJson('/api/v1/remittances');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_update_their_remittance(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $remittance = Remittance::factory()->create(['user_id' => $profile->id]);

        $data = ['sender_name' => 'Updated Sender'];

        $response = $this->putJson("/api/v1/remittances/{$remittance->id}", $data);

        $response->assertStatus(200)
                 ->assertJsonPath('data.sender_name', 'Updated Sender');

        $this->assertDatabaseHas('remittances', [
            'id' => $remittance->id,
            'sender_name' => 'Updated Sender',
        ]);
    }

    public function test_user_can_delete_their_remittance(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $remittance = Remittance::factory()->create(['user_id' => $profile->id]);

        $response = $this->deleteJson("/api/v1/remittances/{$remittance->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('remittances', ['id' => $remittance->id]);
    }

    public function test_user_cannot_access_another_users_remittance(): void
    {
        $profile1 = Profile::factory()->create();
        $profile2 = Profile::factory()->create();
        
        $remittance = Remittance::factory()->create(['user_id' => $profile1->id]);

        Sanctum::actingAs($profile2, ['*']);

        $this->getJson("/api/v1/remittances/{$remittance->id}")->assertStatus(403);
        $this->putJson("/api/v1/remittances/{$remittance->id}", ['sender_name' => 'Hack'])->assertStatus(403);
        $this->deleteJson("/api/v1/remittances/{$remittance->id}")->assertStatus(403);
    }
}
