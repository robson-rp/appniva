<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\SchoolFee;
use App\Models\SchoolFeeTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SchoolFeeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_school_fee_template(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $data = [
            'name' => 'Primary School Template',
            'school_name' => 'Green Valley Academy',
            'amount' => 75000.50,
            'education_level' => 'Primary',
            'fee_type' => 'Tuition',
            'is_recurring' => true,
        ];

        $response = $this->postJson('/api/v1/school-fee-templates', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Primary School Template');

        $this->assertDatabaseHas('school_fee_templates', [
            'user_id' => $profile->id,
            'name' => 'Primary School Template',
        ]);
    }

    public function test_user_can_create_school_fee(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $data = [
            'school_name' => 'Green Valley Academy',
            'student_name' => 'John Junior',
            'amount' => 75000.50,
            'academic_year' => '2024',
            'due_date' => '2024-03-01',
            'education_level' => 'Primary',
            'fee_type' => 'Tuition',
        ];

        $response = $this->postJson('/api/v1/school-fees', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.student_name', 'John Junior');

        $this->assertDatabaseHas('school_fees', [
            'user_id' => $profile->id,
            'student_name' => 'John Junior',
        ]);
    }

    public function test_user_can_list_their_school_fees(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        SchoolFee::factory()->count(2)->create(['user_id' => $profile->id]);

        $response = $this->getJson('/api/v1/school-fees');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    public function test_user_can_update_their_school_fee(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $schoolFee = SchoolFee::factory()->create(['user_id' => $profile->id]);

        $response = $this->putJson("/api/v1/school-fees/{$schoolFee->id}", [
            'student_name' => 'Updated Student Name'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.student_name', 'Updated Student Name');
    }

    public function test_user_can_delete_their_school_fee(): void
    {
        $profile = Profile::factory()->create();
        Sanctum::actingAs($profile, ['*']);

        $schoolFee = SchoolFee::factory()->create(['user_id' => $profile->id]);

        $response = $this->deleteJson("/api/v1/school-fees/{$schoolFee->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('school_fees', ['id' => $schoolFee->id]);
    }
}
