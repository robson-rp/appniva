<?php

namespace Tests\Unit;

use App\Models\Profile;
use App\Models\Account;
use App\Policies\AccountPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected AccountPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new AccountPolicy();
    }

    /**
     * Test user can view their own account
     */
    public function test_user_can_view_own_account(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);

        $this->assertTrue($this->policy->view($profile, $account));
    }

    /**
     * Test user cannot view another user's account
     */
    public function test_user_cannot_view_other_users_account(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $otherProfile->id]);

        $this->assertFalse($this->policy->view($profile, $account));
    }

    /**
     * Test user can update their own account
     */
    public function test_user_can_update_own_account(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);

        $this->assertTrue($this->policy->update($profile, $account));
    }

    /**
     * Test user cannot update another user's account
     */
    public function test_user_cannot_update_other_users_account(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $otherProfile->id]);

        $this->assertFalse($this->policy->update($profile, $account));
    }

    /**
     * Test user can delete their own account
     */
    public function test_user_can_delete_own_account(): void
    {
        $profile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $profile->id]);

        $this->assertTrue($this->policy->delete($profile, $account));
    }

    /**
     * Test user cannot delete another user's account
     */
    public function test_user_cannot_delete_other_users_account(): void
    {
        $profile = Profile::factory()->create();
        $otherProfile = Profile::factory()->create();
        $account = Account::factory()->create(['user_id' => $otherProfile->id]);

        $this->assertFalse($this->policy->delete($profile, $account));
    }

    /**
     * Test any user can create account
     */
    public function test_any_user_can_create_account(): void
    {
        $profile = Profile::factory()->create();

        $this->assertTrue($this->policy->create($profile));
    }
}
