<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test unauthenticated user cannot access categories
     */
    public function test_unauthenticated_user_cannot_access_categories(): void
    {
        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can list their categories
     */
    public function test_user_can_list_their_categories(): void
    {
        $profile = Profile::factory()->create();
        
        // Create 5 categories for the user
        Category::factory()->count(5)->create([
            'user_id' => $profile->id,
        ]);

        // Create categories for another user
        $otherProfile = Profile::factory()->create();
        Category::factory()->count(3)->create([
            'user_id' => $otherProfile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    /**
     * Test user can create a category
     */
    public function test_user_can_create_category(): void
    {
        $profile = Profile::factory()->create();

        Sanctum::actingAs($profile, ['*']);

        $categoryData = [
            'name' => 'Food & Dining',
            'type' => 'expense',
            'icon' => '🍔',
            'color' => '#FF5733',
            'is_default' => false,
        ];

        $response = $this->postJson('/api/v1/categories', $categoryData);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Food & Dining')
                 ->assertJsonPath('data.type', 'expense');

        $this->assertDatabaseHas('categories', [
            'user_id' => $profile->id,
            'name' => 'Food & Dining',
        ]);
    }

    /**
     * Test user can view their own category
     */
    public function test_user_can_view_their_own_category(): void
    {
        $profile = Profile::factory()->create();
        $category = Category::factory()->create([
            'user_id' => $profile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/categories/{$category->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $category->id);
    }

    /**
     * Test user cannot view another user's category
     */
    public function test_user_cannot_view_another_users_category(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $category = Category::factory()->create([
            'user_id' => $otherProfile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->getJson("/api/v1/categories/{$category->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can update their own category
     */
    public function test_user_can_update_their_own_category(): void
    {
        $profile = Profile::factory()->create();
        $category = Category::factory()->create([
            'user_id' => $profile->id,
            'name' => 'Old Name',
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->putJson("/api/v1/categories/{$category->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Name',
        ]);
    }

    /**
     * Test user can delete their own category
     */
    public function test_user_can_delete_their_own_category(): void
    {
        $profile = Profile::factory()->create();
        $category = Category::factory()->create([
            'user_id' => $profile->id,
        ]);

        Sanctum::actingAs($profile, ['*']);

        $response = $this->deleteJson("/api/v1/categories/{$category->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }
}
