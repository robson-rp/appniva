<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserMaturityProfileControllerTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    public function test_can_create_maturity_profile()
    {
        $user = \App\Models\User::factory()->create();
        \App\Models\Profile::factory()->create(['email' => $user->email]);

        $response = $this->actingAs($user)->postJson('/api/v1/user-maturity-profiles', [
            'level' => 'basic',
            'has_debts' => false,
            'has_investments' => false,
            'uses_budget' => true,
            'has_fixed_income' => true,
            'primary_goal' => 'save',
            'onboarding_completed' => true,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.level', 'basic');
        
        $this->assertDatabaseHas('user_maturity_profiles', [
            'user_id' => $user->id,
            'level' => 'basic'
        ]);
    }

    public function test_can_fetch_own_maturity_profile()
    {
        $user = \App\Models\User::factory()->create();
        \App\Models\UserMaturityProfile::create([
            'user_id' => $user->id,
            'level' => 'intermediate',
            'has_debts' => true,
            'has_investments' => false,
            'uses_budget' => true,
            'has_fixed_income' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/user-maturity-profiles');

        $response->assertStatus(200)
                 ->assertJsonPath('data.level', 'intermediate');
    }

    public function test_can_update_maturity_profile()
    {
        $user = \App\Models\User::factory()->create();
        \App\Models\UserMaturityProfile::create([
            'user_id' => $user->id,
            'level' => 'basic',
            'has_debts' => false,
            'has_investments' => false,
            'uses_budget' => false,
            'has_fixed_income' => false,
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/user-maturity-profiles/me', [
            'level' => 'advanced',
            'progress_steps_completed' => 5,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.level', 'advanced')
                 ->assertJsonPath('data.progress_steps_completed', 5);
    }
}
