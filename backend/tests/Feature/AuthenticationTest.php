<?php

namespace Tests\Feature;

use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that Sanctum authentication works
     */
    public function test_sanctum_authentication_works(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/profiles');

        $response->assertStatus(200);
    }

    /**
     * Test that unauthenticated requests are rejected
     */
    public function test_unauthenticated_requests_are_rejected(): void
    {
        $response = $this->getJson('/api/v1/profiles');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can access protected routes
     */
    public function test_authenticated_user_can_access_protected_routes(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/accounts');

        $response->assertStatus(200);
    }
}
