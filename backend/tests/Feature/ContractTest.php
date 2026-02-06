<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContractTest extends TestCase
{
    use RefreshDatabase;

    protected $profile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->profile = Profile::factory()->create();
        Sanctum::actingAs($this->profile, ['*']);
    }

    /**
     * Account Contract Verification
     */
    public function test_account_resource_contract(): void
    {
        Account::factory()->create(['user_id' => $this->profile->id]);

        $response = $this->getJson('/api/v1/accounts');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'type',
                             'current_balance',
                             'initial_balance',
                             'currency',
                             'is_active',
                             'institution_name',
                             'color',
                             'created_at'
                         ]
                     ]
                 ]);
    }

    /**
     * Transaction Contract Verification
     */
    public function test_transaction_resource_contract(): void
    {
        $account = Account::factory()->create(['user_id' => $this->profile->id]);
        $category = Category::factory()->create(['user_id' => $this->profile->id]);
        
        $transaction = Transaction::factory()->create([
            'user_id' => $this->profile->id,
            'account_id' => $account->id,
            'category_id' => $category->id
        ]);

        $response = $this->getJson('/api/v1/transactions');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'account_id',
                             'category_id',
                             'amount',
                             'date',
                             'description',
                             'type',
                             'status',
                             'account' => ['id', 'name', 'currency'],
                             'category' => ['id', 'name', 'icon', 'color', 'type'],
                             'created_at'
                         ]
                     ]
                 ]);
    }

    /**
     * Category Contract Verification
     */
    public function test_category_resource_contract(): void
    {
        Category::factory()->create(['user_id' => $this->profile->id]);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'type',
                             'icon',
                             'color',
                             'is_default',
                             'parent_id'
                         ]
                     ]
                 ]);
    }

    /**
     * Tag Contract Verification
     */
    public function test_tag_resource_contract(): void
    {
        Tag::factory()->create(['user_id' => $this->profile->id]);

        $response = $this->getJson('/api/v1/tags');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'color'
                         ]
                     ]
                 ]);
    }

    /**
     * Stats & Trends Contract Verification
     */
    public function test_transaction_stats_contract(): void
    {
        $response = $this->getJson('/api/v1/transactions/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'income',
                         'expense',
                         'balance'
                     ]
                 ]);
    }

    public function test_transaction_trends_contract(): void
    {
        $response = $this->getJson('/api/v1/transactions/stats/trends');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'month',
                             'monthLabel',
                             'income',
                             'expense',
                             'balance'
                         ]
                     ]
                 ]);
    }
}
