<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Kixikila;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KixikilaTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_kixikila(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $data = [
            'name' => 'Friday Savings',
            'contribution_amount' => 10000.00,
            'frequency' => 'weekly',
            'total_members' => 10,
        ];

        $response = $this->postJson('/api/v1/kixikilas', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Friday Savings');

        $this->assertDatabaseHas('kixikilas', [
            'user_id' => $profile->id,
            'name' => 'Friday Savings',
        ]);
    }

    public function test_user_can_list_their_kixikilas(): void
    {
        $profile = Profile::factory()->create();
        Kixikila::factory()->count(2)->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/kixikilas');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    public function test_user_can_update_their_kixikila(): void
    {
        $profile = Profile::factory()->create();
        $kixikila = Kixikila::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/kixikilas/{$kixikila->id}", [
            'name' => 'Updated Kixikila',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('kixikilas', [
            'id' => $kixikila->id,
            'name' => 'Updated Kixikila',
        ]);
    }

    public function test_user_can_delete_their_kixikila(): void
    {
        $profile = Profile::factory()->create();
        $kixikila = Kixikila::factory()->create(['user_id' => $profile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/kixikilas/{$kixikila->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('kixikilas', ['id' => $kixikila->id]);
    }

    public function test_user_cannot_access_another_users_kixikila(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $kixikila = Kixikila::factory()->create(['user_id' => $otherProfile->id]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/kixikilas/{$kixikila->id}");

        $response->assertStatus(403);
    }
}
